/** Transport-independent descriptors intended for future CLI, SDK and MCP adapters. */
export const toolContracts = [
  {
    id: 'whatsapp-order-to-csv', execution: 'shared-pure',
    summary: 'Extract CSV order rows from multiline order text',
    inputSchema: {type:'object', properties:{text:{type:'string',description:'One order per line'}},required:['text']},
    outputSchema: {type:'object', properties:{items:{type:'array'},skipped:{type:'array'},csv:{type:'string'}}}
  },
  {
    id: 'csv-date-format-fixer', execution: 'shared-pure',
    summary: 'Convert a named CSV date column without guessing ambiguous values',
    inputSchema: {type:'object', properties:{csv:{type:'string'},column:{type:'integer'},input:{type:'string',enum:['AUTO','DMY','MDY','YMD']},output:{type:'string',enum:['ISO','DMY','MDY']},delimiter:{type:'string'}},required:['csv','column','input','output']},
    outputSchema: {type:'object',properties:{csv:{type:'string'},fixed:{type:'integer'},invalid:{type:'integer'},ambiguous:{type:'integer'}}}
  },
  {
    id:'daily-price-list-maker',execution:'shared-pure',summary:'Parse line-based product prices to CSV',
    inputSchema:{type:'object',properties:{text:{type:'string'}},required:['text']},
    outputSchema:{type:'object',properties:{items:{type:'array'},skipped:{type:'array'},csv:{type:'string'}}}
  },
  {
    id:'exam-photo-resizer',execution:'browser-only',summary:'Resize image using browser Canvas',
    inputSchema:{type:'object',properties:{width:{type:'integer'},height:{type:'integer'},maxKB:{type:'number'}}},
    outputSchema:{type:'object',properties:{image:{type:'string'},metTarget:{type:'boolean'}}}
  },
  {
    id:'signature-resize-10kb',execution:'browser-only',summary:'Resize a signature using browser Canvas',
    inputSchema:{type:'object',properties:{width:{type:'integer'},height:{type:'integer'},maxKB:{type:'number'}}},
    outputSchema:{type:'object',properties:{image:{type:'string'},metTarget:{type:'boolean'}}}
  }
] as const;
