import { defaultSchema } from 'hast-util-sanitize';

const textColorClasses = {
  red: 'markdown-text-color--red',
  blue: 'markdown-text-color--blue',
  green: 'markdown-text-color--green',
  orange: 'markdown-text-color--orange',
  purple: 'markdown-text-color--purple',
};

export const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...new Set([...(defaultSchema.tagNames || []), 'font'])],
  attributes: {
    ...defaultSchema.attributes,
    font: [...(defaultSchema.attributes?.font || []), 'color'],
  },
};

export function markdownTextColorClass(color = '') {
  return textColorClasses[String(color).trim().toLowerCase()] || '';
}
