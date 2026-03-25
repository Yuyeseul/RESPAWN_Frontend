import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import styled, { css } from 'styled-components';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';
import CustomImage from './CustomImage';

const fontFamilies = [
  { label: '기본', value: 'inherit' },
  { label: '돋움', value: "'Dotum', sans-serif" },
  { label: '바탕', value: "'Batang', serif" },
  { label: '굴림', value: "'Gulim', sans-serif" },
  { label: '맑은 고딕', value: "'Malgun Gothic', sans-serif" },
];

const fontSizes = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '24px', value: '24px' },
];

// tiptap 툴바 컴포넌트
const MenuBar = ({ editor }) => {
  const [color, setColor] = useState('#000');
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!editor) return null;

  // 이미지 업로드 핸들러
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString();
      if (base64) {
        editor.chain().focus().setImage({ src: base64 }).run();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <MenuBarWrapper>
      <select
        aria-label="글꼴 선택"
        onChange={(e) =>
          editor.chain().focus().setFontFamily(e.target.value).run()
        }
      >
        {fontFamilies.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>

      <select
        aria-label="글자 크기 선택"
        onChange={(e) =>
          editor.chain().focus().setFontSize(e.target.value).run()
        }
      >
        {fontSizes.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>

      {[
        {
          label: 'B',
          command: () => editor.chain().focus().toggleBold().run(),
          active: editor.isActive('bold'),
          title: '굵게 (Ctrl+B)',
        },
        {
          label: 'I',
          command: () => editor.chain().focus().toggleItalic().run(),
          active: editor.isActive('italic'),
          title: '기울임 (Ctrl+I)',
        },
        {
          label: 'U',
          command: () => editor.chain().focus().toggleUnderline().run(),
          active: editor.isActive('underline'),
          title: '밑줄 (Ctrl+U)',
        },
        {
          label: 'H1',
          command: () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
          active: editor.isActive('heading', { level: 1 }),
          title: '헤딩 1',
        },
        {
          label: 'H2',
          command: () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
          active: editor.isActive('heading', { level: 2 }),
          title: '헤딩 2',
        },
        {
          label: '• List',
          command: () => editor.chain().focus().toggleBulletList().run(),
          active: editor.isActive('bulletList'),
          title: '글머리 기호 목록',
        },
        {
          label: '↤',
          command: () => editor.chain().focus().setTextAlign('left').run(),
          title: '왼쪽 정렬',
        },
        {
          label: '↔',
          command: () => editor.chain().focus().setTextAlign('center').run(),
          title: '가운데 정렬',
        },
        {
          label: '↦',
          command: () => editor.chain().focus().setTextAlign('right').run(),
          title: '오른쪽 정렬',
        },
        {
          label: '🖼←',
          command: () => {
            if (editor.isActive('image')) {
              editor
                .chain()
                .focus()
                .updateAttributes('image', {
                  style: 'display: block; margin: 0;',
                })
                .run();
            }
          },
          active:
            editor.isActive('image') &&
            editor.getAttributes('image').style?.includes('margin: 0;'),
          title: '이미지 왼쪽 정렬',
        },
        {
          label: '🖼↔',
          command: () => {
            if (editor.isActive('image')) {
              editor
                .chain()
                .focus()
                .updateAttributes('image', {
                  style: 'display: block; margin: 0 auto;',
                })
                .run();
            }
          },
          active:
            editor.isActive('image') &&
            editor.getAttributes('image').style?.includes('margin: 0 auto;'),
          title: '이미지 가운데 정렬',
        },
        {
          label: '🖼→',
          command: () => {
            if (editor.isActive('image')) {
              editor
                .chain()
                .focus()
                .updateAttributes('image', {
                  style: 'display: block; margin: 0 0 0 auto;',
                })
                .run();
            }
          },
          active:
            editor.isActive('image') &&
            editor
              .getAttributes('image')
              .style?.includes('margin: 0 0 0 auto;'),
          title: '이미지 오른쪽 정렬',
        },
      ].map((btn, i) => (
        <MenuButton key={i} onClick={btn.command} $active={btn.active}>
          {btn.label}
        </MenuButton>
      ))}

      <MenuButton as="label" title="이미지 업로드">
        🖼 업로드
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </MenuButton>

      <MenuButton
        onClick={() => setShowColorPicker(!showColorPicker)}
        title="글자 색상 선택"
      >
        🎨
      </MenuButton>

      {showColorPicker && (
        <ColorPickerWrapper onClick={() => setShowColorPicker(false)}>
          <SketchPicker
            color={color}
            onChange={(updatedColor) => {
              setColor(updatedColor.hex);
              editor.chain().focus().setColor(updatedColor.hex).run();
            }}
          />
          <CloseColorPicker onClick={() => setShowColorPicker(false)}>
            ✕
          </CloseColorPicker>
        </ColorPickerWrapper>
      )}

      <MenuButton
        onClick={() => {
          const url = prompt('링크 URL을 입력하세요');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        title="링크 삽입"
      >
        🔗
      </MenuButton>

      <MenuButton
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        title="모두 초기화"
      >
        ⟳
      </MenuButton>
    </MenuBarWrapper>
  );
};

// tiptap 에디터 메인 컴포넌트
export default function TiptapEditor({ value = '', onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      CustomImage,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    autofocus: false,
    onUpdate: ({ editor }) => {
      onChange && onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (
      editor &&
      editor.view &&
      !editor.isDestroyed &&
      value !== editor.getHTML()
    ) {
      editor.commands.setContent(value, false);
      // setTimeout(() => {
      //   if (editor.view && !editor.isDestroyed) {
      //     editor.commands.focus();
      //   }
      // }, 0);
    }
  }, [value, editor]);

  return (
    <EditorContainer>
      <EditorLabel>내용</EditorLabel>
      <EditorWrapper>
        <MenuBar editor={editor} />
        <StyledEditorContent editor={editor} />
      </EditorWrapper>
    </EditorContainer>
  );
}

const EditorContainer = styled.div`
  max-width: 820px;
  margin: 40px auto;
  background: #fff;
  border-radius: 14px;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  box-shadow: 0 10px 25px rgb(0 0 0 / 0.08);
  padding: 24px 32px;
`;

const EditorLabel = styled.label`
  display: block;
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 14px;
  color: #212529;
  user-select: none;
`;

const EditorWrapper = styled.div`
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  padding: 18px 22px;
  min-height: 340px;
  background: #fefefe;
  box-shadow: inset 0 0 6px #f0f0f0;
  transition: border-color 0.3s ease;

  &:focus-within {
    border-color: #0056b3;
    box-shadow: 0 0 8px #0056b3aa;
  }
`;

const MenuBarWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
  border-bottom: 1.5px solid #d3d3d3;
  padding-bottom: 10px;
  user-select: none;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const activeStyle = css`
  background-color: #0056b3;
  color: white;
  border-color: #004494;
`;

const MenuButton = styled.button.attrs(() => ({
  type: 'button',
}))`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 34px;
  padding: 0 14px;

  font-size: 15px;
  font-weight: 600;
  color: #444;
  margin-right: 6px;
  border: 1.5px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 6px;
  user-select: none;
  transition: all 0.15s ease;

  ${(props) => props.$active && activeStyle}

  &:hover {
    background: #e7f0ff;
    border-color: #99bfff;
    color: #004494;
  }

  /* label로 감싼 파일 input */
  label {
    all: unset;
    display: inline-block;
    width: 100%;
    height: 100%;
    cursor: pointer;
    text-align: center;
    line-height: 1;
  }
`;

const StyledEditorContent = styled(EditorContent)`
  min-height: 230px;
  outline: none;
  padding: 12px 8px;
  font-size: 16px;
  line-height: 1.7;
  color: #212529;

  p,
  h1,
  h2 {
    text-align: inherit;
  }

  p {
    margin: 0 0 22px 0;
  }

  /* 힌트 텍스트 표시 */
  p:empty::before {
    content: attr(data-placeholder);
    color: #bbb;
    pointer-events: none;
    display: inline-block;
    height: 1.2em;
    font-style: italic;
  }

  /* 이미지 스타일 개선 */
  img {
    max-width: 90%;
    height: auto;
    display: block;
    margin: 32px auto;
    border-radius: 8px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
    transition: box-shadow 0.2s ease;
  }

  img:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .ProseMirror {
    padding: 20px 16px;
    box-sizing: border-box;
  }

  .ProseMirror-selectednode {
    outline: 3px solid #0056b3;
    border-radius: 6px;
  }
`;

const ColorPickerWrapper = styled.div`
  position: absolute;
  z-index: 1000;
  margin-top: 8px;
  right: 0;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
`;

const CloseColorPicker = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #555;
  user-select: none;

  &:hover {
    color: #000;
  }
`;
