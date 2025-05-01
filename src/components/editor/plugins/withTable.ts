import { Editor, Element, Transforms, Node, Path } from 'slate';
import { CustomEditor, CustomElement } from '../../../types/editor';
import { MarkdownElementType } from '../../../types/markdown';

/**
 * Plugin to handle table operations in the editor
 */
export const withTable = (editor: CustomEditor): CustomEditor => {
  const { normalizeNode } = editor;

  // Ensure table structure is valid
  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (Element.isElement(node) && node.type === MarkdownElementType.Table) {
      // Ensure table has at least one row
      if (node.children.length === 0) {
        Transforms.insertNodes(
          editor,
          {
            type: MarkdownElementType.TableRow,
            children: [
              {
                type: MarkdownElementType.TableCell,
                children: [{ text: '' }],
              },
            ],
          },
          { at: path }
        );
        return;
      }

      // Ensure each row has the same number of cells
      const rowLengths = node.children
        .filter(child => Element.isElement(child))
        .map(row => row.children.length);
      const maxLength = Math.max(...rowLengths);

      node.children.forEach((row, rowIndex) => {
        if (Element.isElement(row) && row.children.length < maxLength) {
          const cellsToAdd = maxLength - row.children.length;
          for (let i = 0; i < cellsToAdd; i++) {
            Transforms.insertNodes(
              editor,
              {
                type: MarkdownElementType.TableCell,
                children: [{ text: '' }],
              },
              { at: [...path, rowIndex, row.children.length] }
            );
          }
        }
      });
    }

    normalizeNode(entry);
  };

  return editor;
};

/**
 * Insert a new table
 */
export const insertTable = (
  editor: CustomEditor,
  rows: number = 3,
  cols: number = 3
): void => {
  const table: CustomElement = {
    type: MarkdownElementType.Table,
    children: Array.from({ length: rows }, () => ({
      type: MarkdownElementType.TableRow,
      children: Array.from({ length: cols }, () => ({
        type: MarkdownElementType.TableCell,
        children: [{ text: '' }],
      })),
    })),
  };

  // Get the current selection
  const { selection } = editor;
  if (!selection) return;

  // Insert the table at the current selection
  Transforms.insertNodes(editor, table);
  
  // Create a new paragraph at the root level
  const newParagraph: CustomElement = {
    type: 'paragraph',
    children: [{ text: '' }],
  };
  
  // Find the table and insert paragraph after it
  const [tableNode] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && n.type === MarkdownElementType.Table,
  });
  
  if (tableNode) {
    const [, tablePath] = tableNode;
    
    // Insert the new paragraph after the table
    Transforms.insertNodes(editor, newParagraph, { at: [...tablePath.slice(0, -1), tablePath[tablePath.length - 1] + 1] });
    
    // Move selection to the start of the new paragraph
    const nextPath = [...tablePath.slice(0, -1), tablePath[tablePath.length - 1] + 1];
    Transforms.select(editor, {
      anchor: { path: [...nextPath, 0], offset: 0 },
      focus: { path: [...nextPath, 0], offset: 0 }
    });
  }
};

/**
 * Insert a new row
 */
export const insertRow = (editor: CustomEditor): void => {
  const [table] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && n.type === MarkdownElementType.Table,
  });

  if (table) {
    const [tableNode, tablePath] = table;
    if (Element.isElement(tableNode)) {
      const rowCount = tableNode.children.length;
      const firstRow = tableNode.children[0];
      const colCount = Element.isElement(firstRow) ? firstRow.children.length : 0;

      const newRow: CustomElement = {
        type: MarkdownElementType.TableRow,
        children: Array.from({ length: colCount }, () => ({
          type: MarkdownElementType.TableCell,
          children: [{ text: '' }],
        })),
      };

      Transforms.insertNodes(editor, newRow, {
        at: [...tablePath, rowCount],
      });
    }
  }
};

/**
 * Insert a new column
 */
export const insertColumn = (editor: CustomEditor): void => {
  const [table] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && n.type === MarkdownElementType.Table,
  });

  if (table) {
    const [tableNode, tablePath] = table;
    if (Element.isElement(tableNode)) {
      const rowCount = tableNode.children.length;

      for (let i = 0; i < rowCount; i++) {
        const row = tableNode.children[i];
        if (Element.isElement(row)) {
          const newCell: CustomElement = {
            type: MarkdownElementType.TableCell,
            children: [{ text: '' }],
          };

          Transforms.insertNodes(editor, newCell, {
            at: [...tablePath, i, row.children.length],
          });
        }
      }
    }
  }
};

/**
 * Delete the current row
 */
export const deleteRow = (editor: CustomEditor): void => {
  const [table] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && n.type === MarkdownElementType.Table,
  });

  if (table) {
    const [tableNode, tablePath] = table;
    if (Element.isElement(tableNode)) {
      const rowCount = tableNode.children.length;

      if (rowCount > 1) {
        const [row] = Editor.nodes(editor, {
          match: n => Element.isElement(n) && n.type === MarkdownElementType.TableRow,
        });

        if (row) {
          const [, rowPath] = row;
          Transforms.removeNodes(editor, { at: rowPath });
        }
      }
    }
  }
};

/**
 * Delete the current column
 */
export const deleteColumn = (editor: CustomEditor): void => {
  const [table] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && n.type === MarkdownElementType.Table,
  });

  if (table) {
    const [tableNode, tablePath] = table;
    if (Element.isElement(tableNode)) {
      const firstRow = tableNode.children[0];
      if (Element.isElement(firstRow)) {
        const colCount = firstRow.children.length;

        if (colCount > 1) {
          const [cell] = Editor.nodes(editor, {
            match: n => Element.isElement(n) && n.type === MarkdownElementType.TableCell,
          });

          if (cell) {
            const [, cellPath] = cell;
            const colIndex = cellPath[cellPath.length - 1];

            for (let i = 0; i < tableNode.children.length; i++) {
              const row = tableNode.children[i];
              if (Element.isElement(row)) {
                Transforms.removeNodes(editor, {
                  at: [...tablePath, i, colIndex],
                });
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Check if the current selection is in a table
 */
export const isTableActive = (editor: CustomEditor): boolean => {
  const [table] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && n.type === MarkdownElementType.Table,
  });
  return !!table;
}; 