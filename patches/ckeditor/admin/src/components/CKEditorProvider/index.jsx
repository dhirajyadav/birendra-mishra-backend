import React, { memo, useState, useEffect, useRef } from 'react';
import { Field, Flex } from '@strapi/design-system';
import { useField } from '@strapi/strapi/admin';

const CKEditor5Modern = ({ name, value = '', onChange, disabled, required, labelAction, intlLabel, error, description }) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const isInternalChangeRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let localEditor = null;

    async function initCKEditor5() {
      try {
        // Set global license key for CKEditor 5 GPL open source edition
        if (typeof window !== 'undefined') {
          window.CKEDITOR_GLOBAL_LICENSE_KEY = 'GPL';
        }

        // Step 1: Inject official CKEditor 5 CSS if not already injected
        if (!document.getElementById('ckeditor5-core-css')) {
          const link = document.createElement('link');
          link.id = 'ckeditor5-core-css';
          link.rel = 'stylesheet';
          link.href = '/ckeditor5/ckeditor5.css';
          link.onerror = () => {
            link.href = 'https://cdn.ckeditor.com/ckeditor5/43.0.0/ckeditor5.css';
          };
          document.head.appendChild(link);
        }

        // Custom styling for clean Strapi integration
        if (!document.getElementById('ckeditor5-strapi-theme-css')) {
          const customStyle = document.createElement('style');
          customStyle.id = 'ckeditor5-strapi-theme-css';
          customStyle.textContent = `
            .ck-editor {
              width: 100% !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
            }
            .ck-editor__top .ck-sticky-panel .ck-toolbar {
              border-top-left-radius: 6px !important;
              border-top-right-radius: 6px !important;
              border: 1px solid #dcdce4 !important;
              border-bottom: 1px solid #eaeaef !important;
              background-color: #f6f6f9 !important;
              padding: 6px 8px !important;
            }
            .ck.ck-editor__main > .ck-editor__editable {
              min-height: 480px !important;
              max-height: 850px !important;
              border: 1px solid #dcdce4 !important;
              border-top: none !important;
              border-bottom-left-radius: 6px !important;
              border-bottom-right-radius: 6px !important;
              background-color: #ffffff !important;
              font-size: 16px !important;
              line-height: 1.75 !important;
              color: #2b2b36 !important;
              padding: 24px 32px !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif !important;
            }
            .ck.ck-editor__main > .ck-editor__editable:focus {
              border-color: #4945ff !important;
              box-shadow: 0 0 0 2px rgba(73, 69, 255, 0.15) !important;
            }
            .ck.ck-toolbar .ck-toolbar__items {
              flex-wrap: wrap !important;
              gap: 4px !important;
            }
            .ck-rounded-corners .ck.ck-editor__top .ck-sticky-panel .ck-toolbar,
            .ck.ck-editor__top .ck-sticky-panel .ck-toolbar.ck-rounded-corners {
              border-radius: 6px 6px 0 0 !important;
            }
          `;
          document.head.appendChild(customStyle);
        }

        // Step 2: Inject official CKEditor 5 UMD bundle if not yet loaded
        if (!window.CKEDITOR || !window.CKEDITOR.ClassicEditor) {
          await new Promise((resolve, reject) => {
            const existingScript = document.getElementById('ckeditor5-core-bundle');
            if (existingScript) {
              if (window.CKEDITOR && window.CKEDITOR.ClassicEditor) return resolve();
              existingScript.addEventListener('load', resolve);
              existingScript.addEventListener('error', reject);
              return;
            }

            const script = document.createElement('script');
            script.id = 'ckeditor5-core-bundle';
            script.src = '/ckeditor5/ckeditor5.umd.js';
            script.async = true;

            const fallbackToCDN = (res, rej) => {
              console.warn('[CKEditor 5] Local bundle not ready, attempting official CDN fallback...');
              const cdnScript = document.createElement('script');
              cdnScript.src = 'https://cdn.ckeditor.com/ckeditor5/43.0.0/ckeditor5.umd.js';
              cdnScript.async = true;
              cdnScript.onload = () => {
                if (window.CKEDITOR && window.CKEDITOR.ClassicEditor) res();
                else rej(new Error('CKEditor failed to initialize from CDN fallback'));
              };
              cdnScript.onerror = (e) => rej(new Error('Failed to load CKEditor from both local and CDN sources'));
              document.head.appendChild(cdnScript);
            };

            script.onload = () => {
              if (window.CKEDITOR && window.CKEDITOR.ClassicEditor) {
                resolve();
              } else {
                fallbackToCDN(resolve, reject);
              }
            };
            script.onerror = () => {
              fallbackToCDN(resolve, reject);
            };
            document.head.appendChild(script);
          });
        }

        if (!isMounted || !containerRef.current) return;

        // Step 3: Initialize Official CKEditor 5 ClassicEditor
        const CK = window.CKEDITOR;
        const ClassicEditor = CK.ClassicEditor;

        // Build plugins array using available official CKEditor 5 plugins
        const plugins = [
          CK.Essentials,
          CK.Paragraph,
          CK.Heading,
          CK.Bold,
          CK.Italic,
          CK.Underline,
          CK.Strikethrough,
          CK.Code,
          CK.BlockQuote,
          CK.CodeBlock,
          CK.Link,
          CK.LinkImage,
          CK.List,
          CK.ListProperties,
          CK.TodoList,
          CK.Image,
          CK.ImageCaption,
          CK.ImageStyle,
          CK.ImageToolbar,
          CK.ImageResize,
          CK.ImageUpload,
          CK.Base64UploadAdapter,
          CK.Table,
          CK.TableToolbar,
          CK.TableProperties,
          CK.TableCellProperties,
          CK.TableColumnResize,
          CK.TableCaption,
          CK.Alignment,
          CK.FontSize,
          CK.FontFamily,
          CK.FontColor,
          CK.FontBackgroundColor,
          CK.HorizontalLine,
          CK.HtmlEmbed,
          CK.MediaEmbed,
          CK.Highlight,
          CK.WordCount,
          CK.Autoformat,
          CK.PasteFromOffice,
          CK.RemoveFormat,
          CK.FindAndReplace,
          CK.SpecialCharacters,
        ].filter(Boolean);

        const editorConfig = {
          licenseKey: 'GPL',
          plugins,
          toolbar: {
            items: [
              'undo', 'redo', '|',
              'heading', '|',
              'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
              'bold', 'italic', 'underline', 'strikethrough', 'code', 'removeFormat', '|',
              'alignment', '|',
              'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent', '|',
              'link', 'insertImage', 'insertTable', 'blockQuote', 'codeBlock', 'horizontalLine', '|',
              'mediaEmbed', 'highlight'
            ],
            shouldNotGroupWhenFull: true
          },
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
            ]
          },
          table: {
            contentToolbar: [
              'tableColumn', 'tableRow', 'mergeTableCells',
              'tableProperties', 'tableCellProperties'
            ]
          },
          fontSize: {
            options: [9, 11, 13, 'default', 17, 19, 21, 24, 28, 32]
          },
          initialData: value || ''
        };

        // Create editor directly on containerRef.current
        const editor = await ClassicEditor.create(containerRef.current, editorConfig);

        if (!isMounted) {
          editor.destroy();
          return;
        }

        localEditor = editor;
        editorRef.current = editor;
        setLoading(false);

        // Listen for data changes in CKEditor 5
        editor.model.document.on('change:data', () => {
          isInternalChangeRef.current = true;
          const data = editor.getData();
          if (typeof onChange === 'function') {
            onChange({ target: { name, value: data } });
          }
          setTimeout(() => {
            isInternalChangeRef.current = false;
          }, 50);
        });

      } catch (err) {
        console.error('[CKEditor 5] Failed to initialize:', err);
        if (isMounted) {
          setInitError(err.message || 'CKEditor 5 initialization error');
          setLoading(false);
        }
      }
    }

    initCKEditor5();

    return () => {
      isMounted = false;
      if (localEditor) {
        localEditor.destroy().catch(() => {});
        localEditor = null;
      }
      editorRef.current = null;
    };
  }, []);

  // Sync external value updates (e.g. initial load or reset)
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      const currentData = editorRef.current.getData();
      if (currentData !== (value || '')) {
        editorRef.current.setData(value || '');
      }
    }
  }, [value]);

  return (
    <Field.Root name={name} id={name} error={error}>
      <Flex direction="column" alignItems="stretch" gap={1}>
        <Field.Label action={labelAction} required={required}>
          {intlLabel?.defaultMessage || name}
        </Field.Label>

        {loading && (
          <div style={{
            padding: '28px 24px',
            backgroundColor: '#f6f6f9',
            border: '1px dashed #4945ff',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#4945ff',
            fontSize: '14px',
            fontWeight: 500
          }}>
            <span style={{
              display: 'inline-block',
              width: '18px',
              height: '18px',
              border: '2px solid #4945ff',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span>Loading Official CKEditor 5 Document Editor...</span>
          </div>
        )}

        {initError ? (
          <div style={{
            padding: '16px',
            background: '#fff0f0',
            border: '1px solid #ffcccc',
            borderRadius: '6px',
            color: '#d32f2f'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Editor Notice: {initError}</p>
            <textarea
              name={name}
              value={value || ''}
              disabled={disabled}
              onChange={(e) => onChange && onChange(e)}
              rows={14}
              style={{
                width: '100%',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #dcdce4'
              }}
            />
          </div>
        ) : (
          <div ref={containerRef} style={{ width: '100%' }} />
        )}

        <Field.Hint>
          {description?.defaultMessage || 'Write your complete executive article with headings, images, tables, lists, quotes, and embeds using official CKEditor 5.'}
        </Field.Hint>
        <Field.Error />
      </Flex>
    </Field.Root>
  );
};

const CKEditorProvider = (props) => {
  const { name, disabled, labelAction, required, description, error, intlLabel } = props;
  const fieldData = useField(name);

  const handleChange = (event) => {
    if (fieldData && typeof fieldData.onChange === 'function') {
      fieldData.onChange(event);
    } else if (typeof props.onChange === 'function') {
      props.onChange(event);
    }
  };

  return (
    <CKEditor5Modern
      name={name}
      value={fieldData?.value ?? props.value ?? ''}
      onChange={handleChange}
      disabled={disabled}
      labelAction={labelAction}
      required={required}
      intlLabel={intlLabel}
      description={description}
      error={error || fieldData?.error}
    />
  );
};

export default memo(CKEditorProvider);
