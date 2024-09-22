import {
  filterTreeDataById,
  collectTreeFields,
  collectAndCombineData
} from '@scripts/amis/data/tree';

import { Process, Exception, Query } from '@yao/yao';

/**
 * 获取用户的权限信息
 *
 * yao run scripts.auth.lib.getUserPermission '5'
 * @param {number} userId user id
 * @returns
 */
function getUserPermission(userId?: string) {
  let user_id = userId;
  if (!user_id) {
    user_id = Process('session.get', 'user_id');
    if (!user_id) {
      // user_id = "5";
      throw new Exception('缺少用户ID', 500);
    }
  }

  // get user roles
  const user = Process('models.admin.user.find', user_id, {});
  if (user == null) {
    throw new Exception('用户不存在', 500);
  }
  if (user.role == null) {
    return;
    // throw new Exception("用户未配置角色", 500);
  }
  user.role = typeof user.role === 'string' ? user.role.split(',') : user.role;

  if (!Array.isArray(user.role)) {
    // single role
    user.role = [user.role];
  }
  const rolePemissions = user.role.reduce((acc, item) => {
    const role = Process('models.admin.auth.role.find', item, {});
    let perms = role.permission;
    if (role && role.status && perms != null) {
      perms = typeof perms === 'string' ? perms.split(',') : perms;
      if (!Array.isArray(perms)) {
        perms = [perms];
      }
      acc.push(...perms);
    }
    return acc;
  }, []);

  if (rolePemissions.length == 0) {
    return;
    // throw new Exception(`角色未配置权限`, 500);
  }
  const permissions = Process('models.admin.auth.permission.get', {});
  if (permissions.length == 0) {
    return;
    // throw new Exception(`系统未配置权限`, 500);
  }
  const permissionsTree = Process(`utils.arr.Tree`, permissions, {
    parent: 'parent',
    empty: 0
  });

  // 返回的结构是一个嵌套的树结构
  const permissionFilter = filterTreeDataById(permissionsTree, rolePemissions);
  return permissionFilter;
}
/**
 * 获取用户的授权菜单列表id
 * @returns []
 */
function getUserAuthObjectIds(objkey) {
  const permissions = getUserPermission();
  const objIds = collectTreeFields(permissions, objkey);
  return objIds;
}
// yao run scripts.auth.auth_lib.getUserAuthMenuIds
export function getUserAuthMenuIds() {
  return getUserAuthObjectIds('menus');
}
/**
 * get the user auth objects from session
 *
 * the auth objects are set when use login
 * @returns
 */
export function getUserAuthApiCache() {
  let authObjects = Process('session.get', 'user_auth_objects');
  if (authObjects == null || !authObjects) {
    authObjects = getUserAuthApi();
  }
  return authObjects.api;
}

/**
 * get user authorized api object from session
 *
 * yao run scripts.auth.lib.getUserAuthApi
 * @returns
 */
export function getUserAuthApi() {
  const permissions = getUserPermission();
  const api_auth = {} as any;
  api_auth.api_list = collectTreeFields(permissions, 'http_path');
  // map objects => {'API1':['GET','POST']}
  api_auth.api_with_method = collectAndCombineData(
    permissions,
    'http_path',
    'http_method'
  );
  // map objects = > {'GET':['API1','API2']}
  api_auth.method_with_api = collectAndCombineData(
    permissions,
    'http_method',
    'http_path',
    'ANY'
  );

  api_auth.method_with_api = fillApiOpertion(api_auth.method_with_api);
  return api_auth;
}

function fillApiOpertion(methdMap) {
  if (typeof methdMap != 'object') {
    return methdMap;
  }
  methdMap['GET'] ||= [];
  methdMap['POST'] ||= [];
  methdMap['PUT'] ||= [];
  methdMap['DELETE'] ||= [];
  methdMap['PATCH'] ||= [];
  methdMap['OPTIONS'] ||= [];
  methdMap['HEAD'] ||= [];
  methdMap['ANY'] ||= [];
  return methdMap;
}

function getUserAuthModelCache() {
  const authObjects = Process('session.get', 'user_auth_objects');
  if (authObjects == null || !authObjects) {
    return getUserAuthModel();
  }
  return authObjects.model;
}
export function getUserAuthModel() {
  const permissions = getUserPermission();
  const model_auth = {} as any;

  model_auth.model_list = collectTreeFields(permissions, 'models');
  // map objects => {'folder':['READ','UPDATE']}
  model_auth.model_with_method = collectAndCombineData(
    permissions,
    'models',
    'model_method'
  );
  // map objects = > {'READ':['fmod','folder1']}
  model_auth.method_with_model = collectAndCombineData(
    permissions,
    'model_method',
    'models',
    'ANY'
  );

  model_auth.method_with_model = fillModelOpertion(
    model_auth.method_with_model
  );
  return model_auth;
}
function fillModelOpertion(methdMap) {
  if (typeof methdMap != 'object') {
    return methdMap;
  }
  methdMap['ANY'] ||= [];
  methdMap['CREATE'] ||= [];
  methdMap['UPDATE'] ||= [];
  methdMap['DELETE'] ||= [];
  methdMap['READ'] ||= [];
  return methdMap;
}
/**
 * 是否超级用户
 * @returns
 */
export function isSuperUser() {
  const user = Process('session.get', 'user');
  // 超级用户没有限制
  if (user?.type === 'super') {
    return true;
  }
  return false;
}
/**
 * 从缓存中读取用户的目录授权
 * @returns
 */
export function getUserAuthFolderCache() {
  // return getUserAuthFolder();
  const authObjects = Process('session.get', 'user_auth_objects');
  if (authObjects == null || !authObjects) {
    return getUserAuthFolder();
  }
  return authObjects.folder;
}
/**
 * 用户授权目录与操作
 * @returns
 */
export function getUserAuthFolder() {
  const permissions = getUserPermission();
  const folder_auth = {} as any;
  folder_auth.folder_list = collectTreeFields(permissions, 'folders');
  // map objects => {'folder':['READ','UPDATE']}
  folder_auth.folder_with_method = collectAndCombineData(
    permissions,
    'folders',
    'folder_method'
  );
  // map objects = > {'READ':['folder','folder1']}
  folder_auth.method_with_folder = collectAndCombineData(
    permissions,
    'folder_method',
    'folders',
    'ANY'
  );

  folder_auth.method_with_folder = fillFolderOpertion(
    folder_auth.method_with_folder
  );

  return folder_auth;
}
function fillFolderOpertion(methdMap) {
  if (typeof methdMap != 'object') {
    return methdMap;
  }
  methdMap['ANY'] ||= [];
  methdMap['CREATE'] ||= [];
  methdMap['UPDATE'] ||= [];
  methdMap['DELETE'] ||= [];
  methdMap['READ'] ||= [];
  return methdMap;
}
/**
 * 根据用户ID获取用户的权限对象列表
 * 在用户登录时会把用户的权限对象列表加入缓存中。
 * @param {number} userId user id
 * @returns
 */
export function getUserAuthObjects(userId) {
  const permissions = getUserPermission(userId);
  const model_auth = {} as any;

  model_auth.model_list = collectTreeFields(permissions, 'models');
  // map objects => {'MODEL':['READ','UPDATE']}
  model_auth.model_with_method = collectAndCombineData(
    permissions,
    'models',
    'model_method'
  );
  // map objects = > {'READ':['MODEL1','MODEL2']}
  model_auth.method_with_model = collectAndCombineData(
    permissions,
    'model_method',
    'models',
    'ANY'
  );
  fillModelOpertion(model_auth.method_with_model);

  const api_auth = {} as any;
  api_auth.api_list = collectTreeFields(permissions, 'http_path');
  // map objects => {'API1':['GET','POST']}
  api_auth.api_with_method = collectAndCombineData(
    permissions,
    'http_path',
    'http_method'
  );
  // map objects = > {'GET':['API1','API2']}
  api_auth.method_with_api = collectAndCombineData(
    permissions,
    'http_method',
    'http_path',
    'ANY'
  );
  fillApiOpertion(api_auth.method_with_api);

  const folder_auth = {} as any;
  folder_auth.folder_list = collectTreeFields(permissions, 'folders');
  // map objects => {'folder':['READ','UPDATE']}
  folder_auth.folder_with_method = collectAndCombineData(
    permissions,
    'folders',
    'folder_method'
  );
  // map objects = > {'READ':['folder','folder1']}
  folder_auth.method_with_folder = collectAndCombineData(
    permissions,
    'folder_method',
    'folders',
    'ANY'
  );

  fillFolderOpertion(folder_auth.method_with_folder);

  const menus = collectTreeFields(permissions, 'menus');

  return { api: api_auth, model: model_auth, folder: folder_auth, menus };
}

// module.exports = {
//   getUserAuthMenuIds,
//   getUserAuthApi,
//   getUserAuthModel,
//   getUserAuthObjects,
//   getUserAuthFolder,
//   getUserAuthFolderCache,
//   isSuperUser,
//   getUserAuthModelCache,
//   getUserAuthApiCache,
// };
