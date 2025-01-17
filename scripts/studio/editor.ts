/**
 * AMIS Editor 文件操作工具
 *
 * 本模块提供了一系列用于处理AMIS编辑器相关文件操作的函数，包括：
 * - 页面文件的创建、读取、保存和删除
 * - 页面文件与数据库之间的同步
 * - 文件备份和恢复
 * - 用户目录管理
 *
 * 主要功能：
 * 1. 在amis-editor里创建或修改页面配置后可以先保存成文件，在确定没有问题后再加载到数据库
 * 2. 提供工作目录和正式目录的隔离，防止误操作
 * 3. 支持页面文件的版本管理和备份
 * 4. 提供与Yao框架的集成接口
 *
 * 使用示例：
 * 1. 获取用户目录：yao run scripts.studio.editor.getUserDir
 * 2. 获取页面列表：yao run scripts.studio.editor.getPages
 * 3. 保存页面：yao run scripts.studio.editor.savePage "pageName" "{...pageData}"
 * 4. 加载页面到数据库：yao run scripts.studio.editor.loadPageToDB
 *
 * 注意事项：
 * 1. 所有文件操作都在指定工作目录下进行，避免直接修改生产环境文件
 * 2. 文件删除操作会先移动到.trash目录进行备份
 * 3. 页面文件必须符合AMIS JSON格式规范
 */

import { FileNameConvert } from '@scripts/system/lib';
import { FS, log, Process } from '@yao/yao';

// 1 防止误操作，在特定的目录下使用editor的创建与编辑，创建好后再手动复制到正式的目录pages
// 2 编辑器的功能比较简单，目录结构不支持嵌套的目录结构
const pagesWorking = '/public/amis-admin/pages_working/';
const pagesFolder = '/public/amis-admin/pages/';

export function getUserDir() {
  let user_id = Process('session.get', 'user_id');
  if (!user_id) {
    user_id = '1';
  }
  let dir = `${pagesWorking}/${user_id}/`;
  dir = dir.replaceAll('\\', '/');
  dir = dir.replaceAll('/', '/');
  Mkdir(dir);
  return dir;
}
// 读取所有的page列表
//    curl -X POST http://127.0.0.1:5077/service/editor \
//    -H 'Content-Type: application/json' \
//    -H 'Authorization: Bearer <Studio JWT>' \
//    -d '{"method":"getPages","args":[]}}'
export function getPages(dir: string) {
  if (dir == null) {
    dir = getUserDir();
  }

  const fs = new FS('app');
  let files = fs.ReadDir(dir, true); // recursive
  // console.log("files:", files);

  files = files
    .map((str) => {
      str = str.replaceAll('\\', '/');
      // console.log("dir:", dir);
      if (str.endsWith('.json') && str.startsWith(dir)) {
        return str.substr(dir.length);
      }
    })
    .filter((x) => x);

  const result = {};

  files.forEach((file) => {
    const dataString = fs.ReadFile(dir + file);
    try {
      const page = JSON.parse(dataString);
      // 不处理多页应用
      if (page.type && page.type !== 'app') {
        const filename = file.replace(/\.json$/, '');
        result[filename] = page;
      } else {
        log.Warn(`AMIS文件格式不正确:${dir + file}`);
      }
    } catch (error) {
      log.Error(`error when parse json:${dir + file}` + error.message);
    }
  });

  return result;
}

// yao run scripts.stuido.editor.saveFileRecord 1, "xxx/test.json"
export function saveFileRecord(user_id: number, file_name: string) {
  // console.log(`saveFileRecord userid:${user_id},filename:${file_name}`);

  if (!user_id || !file_name) {
    return;
  }
  const [record] = Process('models.system.file.get', {
    wheres: [
      { column: 'user_id', value: user_id },
      { column: 'file_name', value: file_name, method: 'where' }
    ],
    limit: 1
  });
  if (!record) {
    Process('models.system.file.save', { user_id, file_name });
  } else {
    // 更新时间
    Process('models.system.file.save', record);
  }
}
// yao run scripts.stuido.editor.deleteFileRecord 1, "/public/amis-admin/pages_working/1/测试.json"
export function deleteFileRecord(user_id: number, file_name: string) {
  // console.log(`deleteFileRecord userid:${user_id},filename:${file_name}`);
  if (!user_id || !file_name) {
    return;
  }
  Process('models.system.file.deletewhere', {
    wheres: [
      { column: 'user_id', value: user_id },
      { column: 'file_name', value: file_name, method: 'where' }
    ]
  });
}
// 保存数据
export function savePage(
  file: string,
  payload: { body: object; type: string }
) {
  if (!file || !payload) {
    return;
  }
  // 空数据
  if (!payload.body && !payload.type) {
    // console.log(`空页面：${file}`);
    return;
  }
  let fname = file;
  if (!fname.toUpperCase().endsWith('.JSON')) {
    fname += '.json';
  }
  const userDir = getUserDir();
  const nfilename = userDir + fname;
  // if (!fs.Exists(nfilename)) {
  let user_id = Process('session.get', 'user_id');
  if (!user_id) {
    user_id = '1';
  }

  // }

  // 备份后再保存
  // 页面变更过于频繁，
  // MoveAndWrite(prefix, fname, payload);
  WriteFile(nfilename, payload);
  // fs.WriteFile(fname, JSON.stringify(payload), "0644");

  // console.log('nfilename', nfilename);
  saveFileRecord(user_id, nfilename);

  return { message: 'Page Saved' };
}
// 删除文件
export function deletePage(file: string) {
  const dir = getUserDir();

  let user_id = Process('session.get', 'user_id');
  if (!user_id) {
    user_id = '1';
  }
  let nfilename = dir + file;
  if (!nfilename.toUpperCase().endsWith('.JSON')) {
    nfilename += '.json';
  }
  deleteFileRecord(user_id, nfilename);

  // 移动到临时目录，而不是真正删除
  return Move(dir, file);
  // fs.remove(fname);
}

// save single page to database
// yao run scripts.stuido.editor.loadSinglePageToDB site.json
export function loadSinglePageToDB(fname: string) {
  const dir = getUserDir();
  const fs = new FS('app');
  const dataString = fs.ReadFile(dir + fname);
  const page = JSON.parse(dataString);
  if (page.type && page.type !== 'app') {
    // let filename = fname.replace(/\.json$/, "");
    // 不能删除后缀
    Process('widget.save', 'amis', fname, page);
  }
}

// dump the pages form database to file
// yao run scripts.stuido.editor.dumpPagesFromDB
export function dumpPagesFromDB() {
  const pages = Process('scripts.editor.getPages');
  for (const key in pages) {
    const page = pages[key];
    if (page.type && page.type !== 'app') {
      savePage(key, page);
    }
  }
}
// yao run scripts.stuido.editor.dumpSinglePageFromDB "tables.json"
export function dumpSinglePageFromDB(fname: string) {
  const page = Process('scripts.editor.getPage', fname);
  if (page.type && page.type !== 'app') {
    savePage(fname, page);
  }
}

/**
 * 创建yao dsl 配置文件，如果已经存在，移动到.trash目录
 *
 * yao run scripts.studio.editor.MoveAndWrite
 * @param folder Yao应用目录，相对于Yao App根目录
 * @param file 文件名
 * @param dsl dsl定义对象，会自动的转换成json
 */
export function MoveAndWrite(folder: string, file: string, dsl: object) {
  Move(folder, file);
  WriteFile(folder ? `/${folder}/` + file : file, dsl);
}
/**
 * write yao dsl json file
 *
 * yao run scripts.studio.editor.WriteFile fname data
 * @param {string} filename json file name
 * @param {object} data
 */
export function WriteFile(filename: string, data: object) {
  const fs = new FS('app');
  const nfilename = FileNameConvert(filename);
  if (!fs.Exists(nfilename)) {
    const folder = nfilename.split('/').slice(0, -1).join('/');
    if (!fs.Exists(folder)) {
      fs.MkdirAll(folder);
    }
  }
  const res = fs.WriteFile(filename, JSON.stringify(data));
  if (res && res.code && res.message) {
    console.log(`创建配置文件失败【${res.code},${res.message}】：${filename}`);
  } else {
    console.log(`创建配置文件成功：${filename}`);
  }
}

/**
 * yao run scripts.stuido.editor.Move
 * 文件复制移动逻辑
 */
export function Move(dir: string, name: string) {
  let fname = name;
  if (!fname.toUpperCase().endsWith('.JSON')) {
    fname = fname + '.json';
  }
  const sourceFile = dir ? dir + '/' + fname : fname;

  const fs = new FS('app');
  const baseDir = '.trash';
  // 判断文件夹是否存在.不存在就创建

  const newDir = Math.floor(Date.now() / 1000);
  // models的文件移动到
  // 如果已经存在
  if (fs.Exists(sourceFile)) {
    Mkdir(baseDir + '/' + newDir);
    fs.Copy(sourceFile, `${baseDir}/${newDir}/${name}`);
    // 复制完成后,删除文件
    fs.Remove(sourceFile);
    return { message: `成功删除文件:${sourceFile}` };
  } else {
    return { message: `文件:${sourceFile}不存在` };
  }
}
export function Mkdir(name: string) {
  const fs = new FS('app');
  const res = fs.Exists(name);
  if (res !== true) {
    // console.log("make dir:", name);
    fs.MkdirAll(name);
  }
}

//    yao run scripts.stuido.editor.createCurdPage admin.auth.role
//    curl -X POST http://127.0.0.1:5077/service/editor \
//    -H 'Content-Type: application/json' \
//    -H 'Authorization: Bearer <Studio JWT>' \
//    -d '{ "args":["admin.menu"],"method":"createCurdPage"}'
export function createCurdPage(table: string) {
  const page = Process('scripts.amis.curd.curdTemplate', table);

  const fs = new FS('app');
  const fname = pagesWorking + table + '_amis_page.json';
  if (!page.type) {
    // empty page
    return;
  }
  // 备份后再保存
  fs.WriteFile(fname, JSON.stringify(page), '0644');
  // console.log("page saved:", fname);
}

/**
 * 加载设计的页面到数据库中后，才能使用以下的请求
 * /api/__yao/widget/amis/crud-list/setting
 * yao run scripts.stuido.editor.loadPageToDB
 */
export function loadPageToDB() {
  const pages = getPages(pagesFolder);
  for (const key in pages) {
    const page = pages[key];
    let fname = key;
    if (page.type && page.type !== 'app') {
      const compKey = key.toUpperCase();
      if (
        !compKey.endsWith('.JSON') &&
        !compKey.endsWith('.JSONC') &&
        !compKey.endsWith('.YAO') &&
        !compKey.endsWith('.YAM') &&
        !compKey.endsWith('.YAML')
      ) {
        fname += '.json';
      }
      // widget的保存需要文件后缀名。
      // 如果没有后缀名，无法区分文件类型。
      Process('widget.save', 'amis', fname, page);
    }
  }
}
