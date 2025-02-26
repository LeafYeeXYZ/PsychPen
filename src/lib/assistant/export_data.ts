import { ExportTypes } from '@psych/sheet'

export const export_data: AIFunction = {
  label: '导出数据',
  tool: {
    type: 'function',
    function: {
      name: 'export_data',
      description: '你可以调用这个函数来帮助用户导出数据. 调用成功后, 浏览器会自动下载文件.',
      parameters: {
        type: 'object',
        properties: {
          'file_name': {
            type: 'string',
            description: '文件名 (不含拓展名)',
          },
          'file_type': {
            type: 'string',
            description: `文件类型 (${Object.values(ExportTypes).map((type) => `"${type}"`).join(' / ')})`,
          },
        },
        required: ['file_name', 'file_type'],
        additionalProperties: false,
      },
      strict: true,
    },
  },
}
