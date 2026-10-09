/** Human-readable, crawlable help content; no claims of direct external integrations. */
export interface ToolGuide { steps: string[]; faqs: {question: string; answer: string}[]; }
export const guides: Record<string, ToolGuide> = {
  'whatsapp-order-to-csv': {
    steps: [
      'Copy the order messages you want to process from an exported WhatsApp chat or conversation.',
      'Paste the messages into the input box. Use formats such as “2 kg rice”, “rice 2 kg”, or “3x soap”.',
      'Check the recognized items and review all skipped messages before exporting the CSV file.',
    ],
    faqs: [
      {question:'Can I export WhatsApp orders to Excel?',answer:'Yes. Download the generated CSV and open it in Microsoft Excel or Google Sheets. This tool does not connect to your WhatsApp account.'},
      {question:'Will every chat message become an order?',answer:'No. The extractor recognizes common quantity-and-product patterns only. Unrecognized text is listed for manual review and is not silently converted.'},
      {question:'Do my customer messages get uploaded?',answer:'No. Pasted messages are parsed locally in your browser and are not sent to an Aetherexa API.'},
    ],
  },
  'csv-date-format-fixer': {
    steps: [
      'Upload a CSV or TSV file, or paste rows copied from a spreadsheet.',
      'Select the separator, date column, source date convention and preferred output format.',
      'Check the conversion preview and the counts of invalid or ambiguous dates.',
      'Download the corrected CSV. Any unresolved date stays unchanged so you can review it safely.',
    ],
    faqs: [
      {question:'Can I fix DD/MM/YYYY and MM/DD/YYYY dates mixed in one CSV?',answer:'Auto mode converts unambiguous values from both conventions. For dates such as 03/04/2026 that could represent either convention, choose a known source format or review those cells manually.'},
      {question:'Will this change other spreadsheet columns?',answer:'No. Only the selected column is converted. Other data columns remain as supplied, except standard CSV escaping during export.'},
      {question:'Does this accept .xlsx files?',answer:'Not directly. Export the Excel sheet to CSV first, then use this tool and reopen the corrected CSV in your spreadsheet software.'},
    ],
  },
  'daily-price-list-maker': {
    steps: [
      'Enter your shop name and the date you want displayed on the price list.',
      'Paste products one per CSV row using the item, price, unit convention, such as “Rice,65,kg”.',
      'Review the live price board and any rows that could not be parsed.',
      'Choose Print / Save PDF for a shareable board, or Export CSV for a spreadsheet copy.',
    ],
    faqs: [
      {question:'Can kirana shops create a daily price list without signing up?',answer:'Yes. Enter the current prices in the browser and print the generated list without creating an account.'},
      {question:'How do I download a PDF?',answer:'Select Print / Save PDF and choose your browser or operating system’s Save as PDF destination in the print dialog.'},
      {question:'Can the tool upload my price list to WhatsApp?',answer:'No. You can download or print the price list locally and share the resulting file yourself.'},
    ],
  },
  'exam-photo-resizer': {
    steps: [
      'Check the photo dimensions, file-size range, format and background requirements specified by your exam portal.',
      'Choose a JPEG, PNG, WebP, GIF or BMP photo from your device.',
      'Enter the required width, height and maximum KB, then select contain or center-crop.',
      'Resize, confirm the resulting dimensions and actual size, and download the JPEG.',
    ],
    faqs: [
      {question:'Can I resize a photo to 200 × 230 pixels?',answer:'Yes. The exam preset uses 200 × 230 pixels, but always verify your specific exam portal requirements.'},
      {question:'Does reducing photo KB guarantee exam portal acceptance?',answer:'No. Portals may also require specific minimum file sizes, backgrounds, facial framing and image formats. Review every requirement before submitting.'},
      {question:'Is the original photo uploaded to Aetherexa?',answer:'No. Resizing uses your browser’s Canvas feature and does not require a server-side upload.'},
    ],
  },
  'signature-resize-10kb': {
    steps: [
      'Confirm the signature pixel dimensions, background, format and size limit required by the form.',
      'Choose a signature image and enter the exact target width, height and maximum file size in KB.',
      'Resize and review the actual file size. If 10 KB cannot be achieved, adjust your dimensions or image source.',
      'Download the JPEG and check its appearance before uploading it to the application portal.',
    ],
    faqs: [
      {question:'Can this make my signature smaller than 10 KB?',answer:'It attempts to produce JPEG output at or below the configured limit. If the target cannot be reached, a warning shows that the file is too large.'},
      {question:'Can I keep a transparent signature background?',answer:'No. The JPEG output uses a white background. Use a PNG-specific tool if your portal requires transparency.'},
      {question:'Will my signature be saved on your servers?',answer:'No. The image is handled in your browser and is not sent to an Aetherexa upload endpoint.'},
    ],
  },
};
