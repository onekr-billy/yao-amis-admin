import { curdTemplate } from '@scripts/amis/curd';
import { curdListPage } from '@scripts/amis/schema';
import { generateCodeTemplate } from '@scripts/template/tscode';
import { createModelType } from '@scripts/template/tstype';
import { AmisUIColumn, ModelId } from '@yao/types';
import { Process } from '@yao/yao';

export function getCodeGenerationList() {
  return [
    {
      label: 'Amis-CURD-ALL',
      value: 'CRUDAllTemplate'
    },
    {
      label: 'Amis-CURD-List',
      value: 'CRUDListTemplate'
    },
    {
      label: 'Amis-CRUD-New',
      value: 'CRUDNewTemplate'
    },
    {
      label: 'Amis-Table-View',
      value: 'getTableAmisViewFields'
    },
    {
      label: 'Amis-Table-Form',
      value: 'getTableAmisFormViewFields'
    },
    {
      label: 'Amis-Table-Form-View',
      value: 'getTableAmisFormFields'
    },
    {
      label: 'Amis-Table-View-With-Quick',
      value: 'getTableAmisViewFieldsWithQuick'
    },
    {
      label: 'Xgen-All',
      value: 'getXgenAll'
    },
    {
      label: 'Xgen-Table',
      value: 'getXgenTable'
    },
    {
      label: 'Xgen-Table-Full',
      value: 'getXgenTableFull'
    },
    {
      label: 'Xgen-Form',
      value: 'getXgenForm'
    },
    {
      label: 'Xgen-Form-View-Full',
      value: 'getXgenFormFullView'
    },
    {
      label: 'Xgen-Form-Edit-Full',
      value: 'getXgenFormFullEdit'
    },
    {
      label: 'TS-Model-Types',
      value: 'getTSType'
    },
    {
      label: 'TS-Model-Service',
      value: 'getTSModelServiceTemplate'
    }
  ];
}

/**
 * 返回数据库表列表
 * @returns list
 */
export function getTables() {
  // 跟studio的service不同，services不需要跨域
  //    curl -X POST http://127.0.0.1:5099/api/__yao/app/service/schema \
  //    -H 'Content-Type: application/json' \
  //    -H 'Authorization: Bearer <Studio JWT>' \
  //    -d '{ "args":[],"method":"getTables"}'

  const list = Process('schemas.default.Tables');
  const tables = list.map((table) => {
    return { item: table };
  });
  return { rows: tables };
}
/**
 * 返回一个适配amis option类控件的数据库表清单
 * @returns list
 */
export function getTables2() {
  // 跟studio的service不同，services不需要跨域
  //    curl -X POST http://127.0.0.1:5099/api/__yao/app/service/schema \
  //    -H 'Content-Type: application/json' \
  //    -H 'Authorization: Bearer <Studio JWT>' \
  //    -d '{ "args":[],"method":"getTables"}'

  return Process('scripts.system.model.getCachedModelsNameOptions');
}

/**
 * 读取一个数据库表的字段配置信息
 *
 * @param {string} tableName 表名
 * @returns 表的字段定义
 */
export function getTable(tableName: string) {
  // 注意不要直接返回`{columns}`,返回columns会改变amis的table 的columns设置
  const data = Process('schemas.default.TableGet', tableName);
  return { items: data.columns };
}
export function CRUDNewTemplate(modelId: ModelId, columns?: AmisUIColumn[]) {
  return {
    __code_sources: [
      {
        language: 'json',
        title: '增删改查-创建',
        can_preview: true,
        __code_source: Process(
          'scripts.amis.schema.curdNewPage',
          modelId,
          columns
        )
      }
    ]
  };
}

export function CRUDListTemplate(modelId: ModelId, columns?: AmisUIColumn[]) {
  return {
    __code_sources: [
      {
        language: 'json',
        title: '增删改查-列表',
        can_preview: true,
        __code_source: curdListPage(modelId, columns) // Process('scripts.amis.schema.curdListPage',
      }
    ]
  };
}

export function CRUDAllTemplate(modelId: ModelId, columns?: AmisUIColumn[]) {
  return {
    __code_sources: [
      {
        language: 'json',
        title: '增删改查-所有功能',
        can_preview: true,
        __code_source: curdTemplate(modelId, columns) // Process(       'scripts.amis.curd.curdTemplate',
      }
    ]
  };
}

/**
 * 生成模型的TS类型定义
 * @param {string} modelId 模型定义
 * @returns string
 */
export function getTSType(modelId: string, columns?: AmisUIColumn[]) {
  return {
    __code_sources: [
      {
        language: 'typescript',
        title: 'Ts类型',
        __code_source: createModelType(modelId, columns)
      }
    ]
  };
}
/**
 * 生成模型对应的处理代码
 * @param modelId
 * @param columns
 * @returns
 */
export function getTSModelServiceTemplate(
  modelId: string,
  columns?: AmisUIColumn[]
) {
  return {
    __code_sources: [
      {
        language: 'typescript',
        title: '模型TS函数模板',
        __code_source: generateCodeTemplate(modelId, columns)
      }
    ]
  };
}

/**
 * 生成amis table控件的列表字段定义
 * @param {string} modelId 模型名称
 * @returns list
 */
export function getTableAmisViewFields(
  modelId: ModelId,
  columns?: AmisUIColumn[]
) {
  return {
    __code_sources: [
      {
        language: 'json',
        title: '表单查看',
        can_preview: true,
        __code_source: Process(
          'scripts.amis.schema.generateViewFields',
          modelId,
          columns
        )
      }
    ]
  };
}
/**
 * 生成amis表单编辑定义字段列表
 * @param {string} modelId 模型名称
 * @returns list
 */
export function getTableAmisFormFields(
  modelId: ModelId,
  columns?: AmisUIColumn[]
) {
  return {
    __code_sources: [
      {
        language: 'json',
        title: '表单编辑',
        can_preview: true,
        __code_source: Process(
          'scripts.amis.schema.generateEditFormFields',
          modelId,
          columns
        )
      }
    ]
  };
}

/**
 * 生成amis表单查看字段列表
 * @param {string} modelId 模型名称
 * @returns list
 */
export function getTableAmisFormViewFields(
  modelId: ModelId,
  columns?: AmisUIColumn[]
) {
  return {
    __code_sources: [
      {
        language: 'json',
        title: '表单查看',
        can_preview: true,
        __code_source: Process(
          'scripts.amis.schema.formViewFieldsSchema',
          modelId,
          columns
        )
      }
    ]
  };
}

/**
 * 根据模型名称生成amis crud控件的查看字段列表，并带有快速编辑功能
 * @param {string} modelId 模型名称
 * @returns
 */
export function getTableAmisViewFieldsWithQuick(
  modelId,
  columns?: AmisUIColumn[]
) {
  return {
    __code_sources: [
      {
        language: 'json',
        title: '列表查看-带快速编辑',
        can_preview: true,
        __code_source: Process(
          'scripts.amis.schema.generateViewFieldsWithQuick',
          modelId,
          columns
        )
      }
    ]
  };
}

/**
 * 根据模型信息生成xgen表定义
 * @param {string} modelId
 * @param {Array} columns
 * @returns
 */
export function getXgenTable(modelId: ModelId, columns?: AmisUIColumn[]) {
  const template = Process(
    'scripts.xgen.schema.generateTableView',
    modelId,
    columns,
    'simple'
  );
  return {
    __code_sources: template
  };
}
/**
 * 根据模型信息生成xgen表定义
 * @param {string} modelId
 * @param {Array} columns
 * @returns
 */
export function getXgenTableFull(modelId: ModelId, columns?: AmisUIColumn[]) {
  const template = Process(
    'scripts.xgen.schema.generateTableView',
    modelId,
    columns,
    'full'
  );
  return {
    __code_sources: template
  };
}

/**
 * 根据模型信息生成xgen表单定义
 * @param {string} modelId
 * @param {Array} columns
 * @returns
 */
export function getXgenForm(modelId: ModelId, columns?: AmisUIColumn[]) {
  return {
    __code_sources: Process(
      'scripts.xgen.schema.generateFormView',
      modelId,
      columns,
      'simple'
    )
  };
}

/**
 * 根据模型信息生成xgen表单定义
 * @param {string} modelId
 * @param {Array} columns
 * @returns
 */
export function getXgenFormFullView(
  modelId: ModelId,
  columns?: AmisUIColumn[]
) {
  return {
    __code_sources: Process(
      'scripts.xgen.schema.generateFormView',
      modelId,
      columns,
      'full',
      'view'
    )
  };
}
/**
 * 根据模型信息生成xgen表单定义
 * @param {string} modelId
 * @param {Array} columns
 * @returns
 */
export function getXgenFormFullEdit(
  modelId: ModelId,
  columns?: AmisUIColumn[]
) {
  return {
    __code_sources: Process(
      'scripts.xgen.schema.generateFormView',
      modelId,
      columns,
      'full',
      'edit'
    )
  };
}

/**
 * 生成xgen所有的对应列表
 * @param {string} modelId 模型标识
 * @param {Array} columns 列定义
 * @returns
 */
export function getXgenAll(modelId: ModelId, columns?: AmisUIColumn[]) {
  const formFullviews = Process(
    'scripts.xgen.schema.generateFormView',
    modelId,
    columns,
    'full',
    'view'
  );

  const formFulledits = Process(
    'scripts.xgen.schema.generateFormView',
    modelId,
    columns,
    'full',
    'edit'
  );

  const tableFullViews = Process(
    'scripts.xgen.schema.generateTableView',
    modelId,
    columns,
    'full'
  );

  const menus = Process(
    'scripts.xgen.schema.generateMenuConfig',
    modelId,
    columns
  );

  return {
    __code_sources: [
      ...tableFullViews,
      ...formFullviews,
      ...formFulledits,
      ...menus
    ]
  };
}
