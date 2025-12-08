import React from 'react';
import styled from 'styled-components';

const QUICK_LINKS = [
  { key: 'call', label: '전화상담', icon: '📞' },
  { key: 'chat', label: '채팅상담', icon: '💬' },
  { key: 'remote', label: '원격지원', icon: '🖥️' },
  { key: 'callback', label: '콜백예약', icon: '⏱️' },
];

const ContactPanel = () => {
  return (
    <TwoColumn>
      <section>
        <SectionTitle>문의 채널</SectionTitle>
        <ActionStack
          items={QUICK_LINKS}
          onClick={(k) => console.log('Contact action:', k)}
        />
      </section>
      <aside>
        <ContactCard />
      </aside>
    </TwoColumn>
  );
};

const ContactTab = () => {
  return <ContactPanel />;
};

export default ContactTab;

const StackBtn = styled.button`
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px;
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: center;
  text-align: left;
  cursor: pointer;
  width: 100%;
  .icon {
    font-size: 18px;
  }
  .label {
    font-weight: 600;
  }
`;

const Stack = styled.div`
  display: grid;
  gap: 10px;
`;

const ActionStack = ({ items, onClick }) => {
  return (
    <Stack>
      {items.map((i) => (
        <StackBtn key={i.key} onClick={() => onClick(i.key)}>
          <div className="icon">{i.icon}</div>
          <div className="label">{i.label}</div>
        </StackBtn>
      ))}
    </Stack>
  );
};

const CallBtn = styled.button`
  margin-top: 10px;
  width: 100%;
  background: var(--green);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 10px;
  font-weight: 700;
  cursor: pointer;
`;

const Contact = styled.div`
  margin-top: 12px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  .title {
    color: var(--muted);
  }
  .num {
    font-size: 22px;
    font-weight: 800;
    margin: 6px 0;
  }
  .time {
    color: var(--muted);
    font-size: 12px;
  }
`;

const ContactCard = () => {
  return (
    <Contact>
      <div className="title">대표 상담센터</div>
      <div className="num">1588-8377</div>
      <div className="time">평일 09:00~18:00 · 점심 12:00~13:00</div>
      <CallBtn>즉시 전화</CallBtn>
    </Contact>
  );
};

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  @media (min-width: 980px) {
    grid-template-columns: 2fr 320px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  margin: 0 0 10px;
`;
