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
    <>
      <MenuBarWrapper>
        <SelectGroup>
          <SelectInput
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
          </SelectInput>

          <SelectInput
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
          </SelectInput>
        </SelectGroup>

        <ButtonGroup>
          {[
            {
              label: 'B',
              command: () => editor.chain().focus().toggleBold().run(),
              active: editor.isActive('bold'),
              title: '굵게',
            },
            {
              label: 'I',
              command: () => editor.chain().focus().toggleItalic().run(),
              active: editor.isActive('italic'),
              title: '기울임',
            },
            {
              label: 'U',
              command: () => editor.chain().focus().toggleUnderline().run(),
              active: editor.isActive('underline'),
              title: '밑줄',
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
              title: '목록',
            },
          ].map((btn, i) => (
            <MenuButton
              key={i}
              onClick={btn.command}
              $active={btn.active}
              title={btn.title}
            >
              {btn.label}
            </MenuButton>
          ))}
        </ButtonGroup>

        <ButtonGroup>
          {[
            {
              label: '↤',
              command: () => editor.chain().focus().setTextAlign('left').run(),
              title: '왼쪽 정렬',
            },
            {
              label: '↔',
              command: () =>
                editor.chain().focus().setTextAlign('center').run(),
              title: '가운데 정렬',
            },
            {
              label: '↦',
              command: () => editor.chain().focus().setTextAlign('right').run(),
              title: '오른쪽 정렬',
            },
          ].map((btn, i) => (
            <MenuButton key={i} onClick={btn.command} title={btn.title}>
              {btn.label}
            </MenuButton>
          ))}
        </ButtonGroup>

        <ButtonGroup>
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
        </ButtonGroup>
      </MenuBarWrapper>

      {showColorPicker && (
        <ColorPickerWrapper>
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
    </>
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
    }
  }, [value, editor]);

  return (
    <EditorContainer>
      <EditorWrapper>
        <MenuBar editor={editor} />
        <StyledEditorContent editor={editor} />
      </EditorWrapper>
    </EditorContainer>
  );
}

const EditorContainer = styled.div`
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;

  @media ${({ theme }) => theme.mobile} {
    margin: 10px auto;
  }
`;

const EditorWrapper = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
  transition: border-color 0.3s ease;
`;

const MenuBarWrapper = styled.div`
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};

  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SelectGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const SelectInput = styled.select`
  height: 36px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.white};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[800]};
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.gray[300]};
  padding-right: 16px;

  &:last-of-type {
    border-right: none;
    padding-right: 0;
  }
`;

const activeStyle = css`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-color: ${({ theme }) => theme.colors.primary};
`;

const MenuButton = styled.button.attrs(() => ({
  type: 'button',
}))`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  min-width: 36px;
  padding: 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[700]};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[400]};
  border-radius: 6px;
  margin-right: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:last-child {
    margin-right: 0;
  }

  ${(props) => props.$active && activeStyle}

  &:hover {
    background: ${({ theme }) => theme.colors.primary_light};
    border-color: ${({ theme }) => theme.colors.gray[500]};
    color: ${({ theme }) => theme.colors.gray[900]};
    ${(props) =>
      props.$active &&
      css`
        background: ${({ theme }) => theme.colors.primary_dark};
        border-color: ${({ theme }) => theme.colors.primary_dark};
        color: ${({ theme }) => theme.colors.white};
      `}
  }

  label {
    all: unset;
    display: inline-flex;
    align-items: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
`;

const StyledEditorContent = styled(EditorContent)`
  min-height: 300px;
  padding: 20px 24px;
  background: ${({ theme }) => theme.colors.white};

  .ProseMirror {
    outline: none;
    min-height: 300px;
    font-size: 15px;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.gray[900]};
    word-break: keep-all;
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
    .ProseMirror {
      font-size: 16px;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 20px auto;
    border-radius: 8px;
  }

  p {
    margin-bottom: 1em;
  }
`;

const ColorPickerWrapper = styled.div`
  position: absolute;
  top: 65px;
  right: 16px;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.white};

  @media ${({ theme }) => theme.mobile} {
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const CloseColorPicker = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[400]};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[800]};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${({ theme }) => theme.colors.gray[100]};
  }
`;
