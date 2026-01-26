import type { ParsedData, FileType } from '@/types';

export interface XMLParseOptions {
  rowSelector?: string;
  attributePrefix?: string;
}

export async function parseXML(
  file: File,
  options: XMLParseOptions = {}
): Promise<ParsedData> {
  const { rowSelector, attributePrefix = '@' } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');

        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          reject(new Error('Invalid XML format'));
          return;
        }

        // Find row elements
        let rowElements: Element[];
        
        if (rowSelector) {
          rowElements = Array.from(xmlDoc.querySelectorAll(rowSelector));
        } else {
          // Auto-detect: find repeated elements at the same level
          rowElements = findRepeatedElements(xmlDoc.documentElement);
        }

        if (rowElements.length === 0) {
          reject(new Error('No data rows found in XML'));
          return;
        }

        // Extract data from elements
        const rows: Record<string, unknown>[] = [];
        const headerSet = new Set<string>();

        for (const element of rowElements) {
          const row = elementToObject(element, attributePrefix);
          Object.keys(row).forEach((key) => headerSet.add(key));
          rows.push(row);
        }

        const headers = Array.from(headerSet);
        const rawData = rows.map((row) =>
          headers.map((h) => row[h] ?? null)
        );

        resolve({
          headers,
          rows,
          rawData,
          fileName: file.name,
          fileType: 'xml' as FileType,
          rowCount: rows.length,
          columnCount: headers.length,
        });
      } catch (error) {
        reject(
          new Error(
            `XML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

function findRepeatedElements(root: Element): Element[] {
  const childCounts = new Map<string, Element[]>();

  // Count children by tag name
  for (const child of Array.from(root.children)) {
    const tagName = child.tagName;
    if (!childCounts.has(tagName)) {
      childCounts.set(tagName, []);
    }
    childCounts.get(tagName)!.push(child);
  }

  // Find the tag with most occurrences (likely the data rows)
  let maxCount = 0;
  let maxElements: Element[] = [];

  for (const [, elements] of childCounts) {
    if (elements.length > maxCount) {
      maxCount = elements.length;
      maxElements = elements;
    }
  }

  // If only one element at this level, recurse into it
  if (maxCount === 1 && root.children.length === 1) {
    return findRepeatedElements(root.children[0]);
  }

  return maxElements;
}

function elementToObject(
  element: Element,
  attributePrefix: string
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};

  // Add attributes
  for (const attr of Array.from(element.attributes)) {
    obj[`${attributePrefix}${attr.name}`] = attr.value;
  }

  // Add child elements
  for (const child of Array.from(element.children)) {
    const key = child.tagName;
    
    // Check if child has children (nested)
    if (child.children.length > 0) {
      // Check if all children have the same tag (array)
      const childTags = Array.from(child.children).map((c) => c.tagName);
      const uniqueTags = new Set(childTags);
      
      if (uniqueTags.size === 1 && childTags.length > 1) {
        // It's an array
        obj[key] = Array.from(child.children).map((c) =>
          c.children.length > 0
            ? elementToObject(c, attributePrefix)
            : c.textContent?.trim() || ''
        );
      } else {
        // It's a nested object
        obj[key] = elementToObject(child, attributePrefix);
      }
    } else {
      // Simple value
      obj[key] = child.textContent?.trim() || '';
    }
  }

  // If no children and no text handled, add text content
  if (Object.keys(obj).length === 0 && element.textContent) {
    return { value: element.textContent.trim() };
  }

  return obj;
}
