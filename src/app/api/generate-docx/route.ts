import { NextRequest, NextResponse } from 'next/server';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import { toDocx } from 'mdast2docx';
import { AlignmentType, ShadingType, convertInchesToTwip } from 'docx';
import type { Root } from 'mdast';
import axios from 'axios';

let jsdomInitialized = false;

async function initJSDOM() {
  if (jsdomInitialized) return;

  const { Window } = await import('happy-dom');
  const window = new Window();

  (global as any).document = window.document;
  (global as any).Node = window.Node;
  (global as any).Element = window.Element;
  (global as any).HTMLElement = window.HTMLElement;
  (global as any).HTMLTableCellElement = window.HTMLTableCellElement;

  jsdomInitialized = true;
}

async function loadPlugins() {
  const [mathPluginModule, tablePluginModule, listPluginModule] = await Promise.all([
    import('@m2d/math'),
    import('@m2d/table'),
    import('@m2d/list')
  ]);
  return {
    mathPlugin: mathPluginModule.mathPlugin,
    tablePlugin: tablePluginModule.tablePlugin,
    listPlugin: listPluginModule.listPlugin
  };
}

const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  a4: { width: 11906, height: 16838 },
  letter: { width: 12240, height: 15840 },
  legal: { width: 12240, height: 20160 }
};

const IMAGE_FETCH_TIMEOUT = 5000;

function getPageDimensions(pageSize: string, orientation: 'portrait' | 'landscape') {
  const size = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
  return orientation === 'landscape'
    ? { width: size.height, height: size.width }
    : { width: size.width, height: size.height };
}

async function fetchImageWithTimeout(url: string, timeout: number): Promise<{ base64: string; mimeType: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const base64 = Buffer.from(response.data).toString('base64');
    const mimeType = response.headers['content-type'] || 'image/png';
    return { base64, mimeType };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchRemoteImages(markdown: string): Promise<string> {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const matches = [...markdown.matchAll(imageRegex)];

  if (matches.length === 0) return markdown;

  const imagePromises = matches.map(async (match, index) => {
    const [, alt, url] = match;
    const placeholder = `__IMAGE_${index}__`;
    try {
      const { base64, mimeType } = await fetchImageWithTimeout(url, IMAGE_FETCH_TIMEOUT);
      const dataUri = `![${alt}](data:${mimeType};base64,${base64})`;
      return { placeholder, dataUri, url, success: true };
    } catch (error) {
      return { placeholder, dataUri: match[0], url, success: false };
    }
  });

  const results = await Promise.allSettled(imagePromises);
  let result = markdown;
  for (const settled of results) {
    if (settled.status === 'fulfilled') {
      const { placeholder, dataUri } = settled.value;
      result = result.replace(placeholder, dataUri);
    }
  }
  return result;
}

function sanitizeFilename(filename: string): string {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return sanitized.endsWith('.docx') ? sanitized : `${sanitized}.docx`;
}

export async function POST(req: NextRequest) {
  try {
    await initJSDOM();

    let body: { markdown?: string; filename?: string; pageSize?: string; orientation?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { markdown, filename = 'document.docx', pageSize = 'a4', orientation = 'portrait' } = body;

    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    let mdast: Root;
    const markdownWithImages = await fetchRemoteImages(markdown);
    const processor = unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeRemark)
      .use(remarkStringify);

    const processed = await processor.process(markdownWithImages);
    const cleanMarkdown = processed.toString();
    mdast = processor.parse(cleanMarkdown) as Root;

    const plugins = await loadPlugins();
    const dimensions = getPageDimensions(pageSize, orientation as any);

    // FIX: Using 'type' instead of 'val' for v9.5.1 compatibility
    const docxProps = {
      title: 'Document',
      styles: {
        default: {
          document: {
            run: { font: 'Bornomala', size: 24, color: "auto" },
            paragraph: {
              spacing: { before: 0, after: 0, line: 240, lineRule: 'auto' as const },
              alignment: AlignmentType.LEFT,
            }
          }
        },
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            run: { font: 'Bornomala', size: 24, color: "auto" },
            paragraph: { shading: { fill: "auto", type: ShadingType.CLEAR } }
          },
          ...['Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6'].map((name, i) => ({
            id: name,
            name: name,
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              font: 'Bornomala',
              size: i === 0 ? 36 : i === 1 ? 28 : 24,
              bold: true,
              color: "auto"
            },
            paragraph: {
              spacing: { before: 240, after: 120 },
              shading: { fill: "auto", type: ShadingType.CLEAR }
            }
          })),
          {
            id: 'Code',
            name: 'Code',
            run: { font: 'Bornomala', size: 24, color: "auto" },
            paragraph: { shading: { fill: "auto", type: ShadingType.CLEAR } }
          }
        ]
      }
    };

    const sectionProps = {
      properties: {
        page: {
          size: { width: dimensions.width, height: dimensions.height },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      plugins: [
        plugins.mathPlugin() as any,
        plugins.tablePlugin({
          tableProps: {
            margins: {
              top: convertInchesToTwip(0),
              bottom: convertInchesToTwip(0),
              left: convertInchesToTwip(0.08),
              right: convertInchesToTwip(0.08),
            },
            tableLook: {
              firstRow: false,
              lastRow: false,
              firstColumn: false,
              lastColumn: false,
              noHBand: true,
              noVBand: true,
            }
          },
          // FIX: Changed 'val' to 'type' here as well
          firstRowCellProps: {
            shading: { fill: "auto", type: ShadingType.CLEAR }
          },
          cellProps: {
            shading: { fill: "auto", type: ShadingType.CLEAR }
          }
        }) as any,
        plugins.listPlugin() as any
      ]
    };

    const blob = await toDocx(mdast as any, docxProps as any, sectionProps as any);
    const arrayBuffer = await (blob as Blob).arrayBuffer();
    const docxBuffer = Buffer.from(arrayBuffer);

    const safeFilename = sanitizeFilename(filename);

    return new NextResponse(docxBuffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': docxBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json({ error: 'Failed to generate DOCX' }, { status: 500 });
  }
}