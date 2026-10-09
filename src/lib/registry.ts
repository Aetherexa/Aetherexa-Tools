export type ToolCategory = 'Business' | 'Data' | 'Images';
export interface ToolDefinition {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: 'message' | 'calendar' | 'tag' | 'image' | 'pen';
  keywords: string[];
  tag?: string;
  featured?: boolean;
}
export const tools: ToolDefinition[] = [
  {
    slug: 'whatsapp-order-to-csv', name: 'WhatsApp Order to CSV', category: 'Business', icon: 'message',
    description: 'Turn pasted WhatsApp product orders into clean CSV rows in seconds.',
    keywords: ['WhatsApp order to Excel', 'WhatsApp orders to CSV', 'order tracker'], tag: 'For sellers', featured: true,
  },
  {
    slug: 'csv-date-format-fixer', name: 'CSV Date Format Fixer', category: 'Data', icon: 'calendar',
    description: 'Fix mixed spreadsheet date formats safely, with a review-first preview.',
    keywords: ['mixed date format converter', 'Excel date format fixer', 'fix CSV dates'], featured: true,
  },
  {
    slug: 'daily-price-list-maker', name: 'Daily Price List Maker', category: 'Business', icon: 'tag',
    description: 'Convert an item-and-price list into a printable, shareable shop price card.',
    keywords: ['kirana price list maker', 'price list maker online', 'daily price list'], tag: 'For shops', featured: true,
  },
  {
    slug: 'exam-photo-resizer', name: 'Exam Photo Resizer', category: 'Images', icon: 'image',
    description: 'Set exact image dimensions and a maximum file size for applications.',
    keywords: ['exam photo resizer', 'photo resize in KB', 'passport photo dimensions'], featured: true,
  },
  {
    slug: 'signature-resize-10kb', name: 'Signature Resizer to 10 KB', category: 'Images', icon: 'pen',
    description: 'Resize a signature to exact pixels and compress to a 10 KB limit.',
    keywords: ['signature resize 10kb', 'signature compress to 10 KB', 'online signature resizer'], featured: true,
  }
];
export const getTool = (slug: string) => tools.find(t => t.slug === slug);
