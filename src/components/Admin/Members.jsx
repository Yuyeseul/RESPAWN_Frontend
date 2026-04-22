import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import Pagination from '../Pagination';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

const parseYMD = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-');
  return new Date(y, m - 1, d);
};

const formatToYMD = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDate = (s) => {
  if (!s) return '-';
  return s.slice(0, 10);
};

const ymdToCompact = (yyyyMMdd) => {
  if (!yyyyMMdd) return '';
  const v = String(yyyyMMdd).trim();
  if (v.length !== 10) return '';
  const compact = v.replaceAll('-', '');
  if (!/^\d{8}$/.test(compact)) return '';
  return compact;
};

const buildDateRange = (from, to) => {
  const f = ymdToCompact(from);
  const t = ymdToCompact(to);
  if (!f && !t) return '';
  return `${f}~${t}`;
};

const Members = () => {
  const navigate = useNavigate();
  const [roleTab, setRoleTab] = useState('buyer');
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  const currentPage = pageInfo.page + 1;
  const totalPages = pageInfo.totalPages;
  const handlePageChange = (page1) => {
    if (page1 < 1 || page1 > currentPage) return;
    setPageInfo((p) => ({ ...p, page: page1 - 1 }));
  };

  const [filters, setFilters] = useState({
    from: '',
    to: '',
    keyword: '',
    field: 'name',
  });

  const SEARCH_OPTIONS = [
    { value: 'name', label: '이름' },
    { value: 'username', label: '아이디' },
    { value: 'email', label: '이메일' },
    { value: 'phoneNumber', label: '전화번호' },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const [appliedFilters, setAppliedFilters] = useState({
    from: '',
    to: '',
    keyword: '',
    field: 'name',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState([]);
  const [sort, setSort] = useState({ field: 'username', dir: 'asc' });

  const fetchMembers = useCallback(
    async (page = pageInfo.page, size = pageInfo.size) => {
      setLoading(true);
      setError('');
      try {
        const url =
          roleTab === 'buyer' ? '/admin/buyers/paged' : '/admin/sellers/paged';

        const dateRange = buildDateRange(
          appliedFilters.from,
          appliedFilters.to
        );
        const params = {
          page,
          size,
          sort: sort.field,
          dir: sort.dir,
          keyword: appliedFilters.keyword || undefined,
          field: appliedFilters.keyword ? appliedFilters.field : undefined,
          dateRange: dateRange || undefined,
        };
        const res = await axios.get(url, { params });

        const content = res.data.content || [];
        const normalized = content.map((u) => ({
          userId: u.id,
          username: u.username ?? '',
          name: u.name ?? '',
          email: u.email ?? '',
          phone: roleTab === 'buyer' ? (u.phoneNumber ?? '') : '',
          company: roleTab === 'seller' ? (u.company ?? '') : '',
          createdAt: u.createdAt ?? '',
          grade: u.grade ?? '',
          userType: u.userType ?? roleTab,
        }));
        setData(normalized);
        setPageInfo({
          page: res.data.number,
          size: res.data.size,
          totalPages: res.data.totalPages,
          totalElements: res.data.totalElements,
          isFirst: res.data.first,
          isLast: res.data.last,
        });
      } catch (e) {
        console.error(e);
        setError('회원 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [roleTab, appliedFilters, sort, pageInfo.page, pageInfo.size]
  );

  useEffect(() => {
    fetchMembers(pageInfo.page, pageInfo.size);
  }, [fetchMembers, pageInfo.page, pageInfo.size]);

  const onChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const onSearch = () => {
    setAppliedFilters({ ...filters });
    setPageInfo((p) => ({ ...p, page: 0 }));
  };

  const onResetFilters = () => {
    const init = { from: '', to: '', keyword: '', field: 'name' };
    setFilters(init);
    setAppliedFilters(init);
    setPageInfo((p) => ({ ...p, page: 0 }));
  };

  const onClickManage = (member) => {
    const type = roleTab === 'buyer' ? 'buyer' : 'seller';
    navigate(`/admin/members/${type}/${member.userId}`);
  };

  const onSort = (field) => {
    setPageInfo((p) => ({ ...p, page: 0 }));
    setSort((prev) => {
      const dir =
        prev.field === field ? (prev.dir === 'asc' ? 'desc' : 'asc') : 'asc';
      return { field, dir };
    });
  };

  useEffect(() => {
    setSort({ field: 'username', dir: 'asc' });
  }, [roleTab]);

  const SortableTh = ({
    field,
    label,
    onClick,
    activeField,
    dir,
    className,
  }) => {
    const isActive = activeField === field;
    const arrow = isActive ? (dir === 'asc' ? '▲' : '▼') : '↕';
    return (
      <th
        className={className}
        aria-sort={
          isActive ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'
        }
      >
        <SortBtn
          type="button"
          onClick={() => onClick(field)}
          data-active={isActive}
          aria-label={`${label} 정렬`}
        >
          <span>{label}</span>
          <i aria-hidden="true" className="arrow">
            {arrow}
          </i>
        </SortBtn>
      </th>
    );
  };

  return (
    <Wrap>
      <Tabs>
        <TabButton
          data-active={roleTab === 'buyer'}
          onClick={() => setRoleTab('buyer')}
        >
          구매자
        </TabButton>
        <TabButton
          data-active={roleTab === 'seller'}
          onClick={() => setRoleTab('seller')}
        >
          판매자
        </TabButton>
      </Tabs>

      <Filters2Rows>
        <Row>
          <Field>
            <label>가입일(시작)</label>
            <DatePickerWrapper>
              <DatePicker
                locale={ko}
                dateFormat="yyyy-MM-dd"
                selected={parseYMD(filters.from)}
                onChange={(date) =>
                  onChangeFilter({
                    target: { name: 'from', value: formatToYMD(date) },
                  })
                }
                selectsStart
                startDate={parseYMD(filters.from)}
                endDate={parseYMD(filters.to)}
                placeholderText="YYYY-MM-DD"
                isClearable
              />
            </DatePickerWrapper>
          </Field>
          <Field>
            <label>가입일(종료)</label>
            <DatePickerWrapper>
              <DatePicker
                locale={ko}
                dateFormat="yyyy-MM-dd"
                selected={parseYMD(filters.to)}
                onChange={(date) =>
                  onChangeFilter({
                    target: { name: 'to', value: formatToYMD(date) },
                  })
                }
                selectsEnd
                startDate={parseYMD(filters.from)}
                endDate={parseYMD(filters.to)}
                minDate={parseYMD(filters.from)}
                placeholderText="YYYY-MM-DD"
                isClearable
              />
            </DatePickerWrapper>
          </Field>
          <Spacer />
        </Row>

        <Row>
          <Field>
            <label>검색 대상</label>
            <CustomSelectWrapper
              ref={dropdownRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <SelectBox $isOpen={isDropdownOpen}>
                <span className="selected-text">
                  {
                    SEARCH_OPTIONS.find((opt) => opt.value === filters.field)
                      ?.label
                  }
                </span>
                <span className="arrow">▼</span>
              </SelectBox>

              {isDropdownOpen && (
                <OptionList>
                  {SEARCH_OPTIONS.map((opt) => (
                    <OptionItem
                      key={opt.value}
                      $active={filters.field === opt.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeFilter({
                          target: { name: 'field', value: opt.value },
                        });
                        setIsDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                    </OptionItem>
                  ))}
                </OptionList>
              )}
            </CustomSelectWrapper>
          </Field>
          <Field>
            <label>검색어</label>
            <input
              name="keyword"
              value={filters.keyword}
              onChange={onChangeFilter}
              placeholder="이름/아이디/이메일/전화"
            />
          </Field>
          <ActionsRow>
            <SearchBtn onClick={onSearch}>검색</SearchBtn>
            <ResetBtn onClick={onResetFilters}>초기화</ResetBtn>
          </ActionsRow>
        </Row>
      </Filters2Rows>

      <TableWrap>
        <table>
          <thead>
            <tr>
              <th className="col-no">번호</th>
              <SortableTh
                field="name"
                label="이름"
                onClick={onSort}
                activeField={sort.field}
                dir={sort.dir}
                className="col-name"
              />
              <SortableTh
                field="username"
                label="아이디"
                onClick={onSort}
                activeField={sort.field}
                dir={sort.dir}
                className="col-username"
              />
              {roleTab === 'buyer' ? (
                <SortableTh
                  field="phoneNumber"
                  label="전화번호"
                  onClick={onSort}
                  activeField={sort.field}
                  dir={sort.dir}
                  className="col-phone"
                />
              ) : (
                <SortableTh
                  field="company"
                  label="회사명"
                  onClick={onSort}
                  activeField={sort.field}
                  dir={sort.dir}
                  className="col-company"
                />
              )}
              <SortableTh
                field="email"
                label="이메일"
                onClick={onSort}
                activeField={sort.field}
                dir={sort.dir}
                className="col-email"
              />
              {roleTab === 'buyer' && (
                <SortableTh
                  field="grade"
                  label="등급"
                  onClick={onSort}
                  activeField={sort.field}
                  dir={sort.dir}
                  className="col-grade"
                />
              )}
              <SortableTh
                field="createdAt"
                label="가입일"
                onClick={onSort}
                activeField={sort.field}
                dir={sort.dir}
                className="col-joined"
              />
              <th className="col-actions">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="status-row">
                <td colSpan={8}>로딩중...</td>
              </tr>
            ) : error ? (
              <tr className="status-row error">
                <td colSpan={8}>{error}</td>
              </tr>
            ) : data.length === 0 ? (
              <tr className="status-row">
                <td colSpan={8}>조건에 맞는 회원이 없습니다.</td>
              </tr>
            ) : (
              data.map((m, idx) => (
                <tr key={m.userId}>
                  <td className="col-no" data-label="번호">
                    {idx + 1}
                  </td>
                  <td className="col-name" data-label="이름">
                    <strong>{m.name}</strong>
                  </td>
                  <td className="col-username" data-label="아이디">
                    {m.username}
                  </td>
                  {roleTab === 'buyer' ? (
                    <td className="col-phone" data-label="전화번호">
                      {m.phone}
                    </td>
                  ) : (
                    <td className="col-company" data-label="회사명">
                      {m.company}
                    </td>
                  )}
                  <td className="col-email" data-label="이메일">
                    {m.email}
                  </td>
                  {roleTab === 'buyer' && (
                    <td className="col-grade" data-label="등급">
                      <GradeBadge grade={m.grade}>{m.grade || '-'}</GradeBadge>
                    </td>
                  )}
                  <td className="col-joined" data-label="가입일">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="col-actions">
                    <ManageBtn onClick={() => onClickManage(m)}>관리</ManageBtn>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrap>

      <PaginationBar>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isFirst={pageInfo.isFirst}
          isLast={pageInfo.isLast}
        />
      </PaginationBar>
    </Wrap>
  );
};

export default Members;

// === 스타일 영역 ===

const GradeBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: ${({ theme: { colors } }) => colors.gray[100]};
  color: ${({ theme: { colors } }) => colors.secondary};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
`;

const Wrap = styled.div`
  display: grid;
  gap: 12px;
`;

const Tabs = styled.div`
  display: inline-flex;
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
  background: ${({ theme: { colors } }) => colors.gray[50]};
`;

const TabButton = styled.button`
  all: unset;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: ${({ theme: { colors } }) => colors.gray[600]};
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &[data-active='true'] {
    background: ${({ theme: { colors } }) => colors.white};
    color: ${({ theme: { colors } }) => colors.secondary};
    border-color: ${({ theme: { colors } }) => colors.gray[300]};
    font-weight: 700;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
`;

const Filters2Rows = styled.div`
  display: grid;
  gap: 16px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 260px 260px 260px 1fr;
  gap: 12px;
  align-items: end;

  @media ${({ theme }) => theme.mobile} {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme: { colors } }) => colors.gray[650]};
  }

  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid ${({ theme: { colors } }) => colors.gray[300]};
    border-radius: 8px;
    outline: none;
    background: ${({ theme: { colors } }) => colors.white};
    color: ${({ theme: { colors } }) => colors.gray[900]};
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  input:hover {
    border-color: ${({ theme: { colors } }) => colors.gray[400]};
  }

  input:focus {
    border-color: ${({ theme: { colors } }) => colors.secondary};
    box-shadow: 0 0 0 3px ${({ theme: { colors } }) => colors.primary_alpha};
  }
`;

const Spacer = styled.div`
  @media ${({ theme }) => theme.mobile} {
    display: none;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: end;

  @media ${({ theme }) => theme.mobile} {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-top: 8px;
  }
`;

const ButtonBase = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: translateY(1px);
  }
`;

const SearchBtn = styled(ButtonBase)`
  background: ${({ theme: { colors } }) => colors.secondary};
  color: ${({ theme: { colors } }) => colors.white};
  border: 1px solid transparent;

  &:hover {
    background: ${({ theme: { colors } }) => colors.primary};
  }
`;

const ResetBtn = styled(ButtonBase)`
  background: ${({ theme: { colors } }) => colors.white};
  color: ${({ theme: { colors } }) => colors.gray[700]};
  border: 1px solid ${({ theme: { colors } }) => colors.gray[300]};

  &:hover {
    border-color: ${({ theme: { colors } }) => colors.gray[400]};
    background: ${({ theme: { colors } }) => colors.gray[50]};
  }
`;

const TableWrap = styled.div`
  width: 100%;
  max-width: 1300px;
  background: ${({ theme: { colors } }) => colors.white};
  margin-top: 16px;
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  border-radius: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme: { colors } }) => colors.gray[300]};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  table {
    width: 100%;
    min-width: 900px;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 14px;
    line-height: 1.5;
  }

  th,
  td {
    padding: 12px 12px;
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    color: ${({ theme: { colors } }) => colors.gray[800]};
  }

  th {
    background: ${({ theme: { colors } }) => colors.gray[50]};
    font-weight: 600;
    color: ${({ theme: { colors } }) => colors.gray[700]};
  }

  .col-no {
    width: 80px;
  }
  .col-name {
    width: 140px;
  }
  .col-username {
    width: 140px;
  }
  .col-phone,
  .col-company {
    width: 160px;
  }
  .col-email {
    width: 220px;
  }
  .col-grade {
    width: 100px;
  }
  .col-joined {
    width: 140px;
  }
  .col-actions {
    width: 100px;
  }

  tbody tr:hover {
    background: ${({ theme: { colors } }) => colors.primary_light};
  }

  @media ${({ theme }) => theme.mobile} {
    background: transparent;
    border: none;
    overflow: visible;

    table,
    thead,
    tbody,
    th,
    td,
    tr {
      display: block;
    }

    table {
      min-width: auto;
    }

    thead {
      display: none;
    }

    tbody tr {
      position: relative;
      background: ${({ theme: { colors } }) => colors.white};
      border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
      border-radius: 12px;
      margin-bottom: 16px;
      padding: 16px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
      box-sizing: border-box;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
        background: ${({ theme: { colors } }) => colors.white};
      }
    }

    td {
      border: none;
      padding: 0;
      text-align: left;
      width: 100%;
      white-space: normal;
      box-sizing: border-box;
    }

    .col-no {
      font-size: 13px;
      color: ${({ theme: { colors } }) => colors.gray[600]};
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray[100]};
    }
    .col-no::before {
      content: '번호: ';
    }

    .col-joined {
      position: absolute;
      top: 16px;
      right: 16px;
      width: auto;
      font-size: 13px;
      color: ${({ theme: { colors } }) => colors.gray[500]};
    }

    .col-name {
      font-size: 16px;
      font-weight: 700;
      color: ${({ theme: { colors } }) => colors.gray[900]};
      margin-bottom: 6px;
    }

    .col-username {
      display: inline-block;
      width: auto;
      font-size: 14px;
      font-weight: 600;
      color: ${({ theme: { colors } }) => colors.secondary};
    }

    .col-phone,
    .col-company {
      display: inline-block;
      width: auto;
      font-size: 14px;
      color: ${({ theme: { colors } }) => colors.gray[600]};
    }
    .col-phone::before,
    .col-company::before {
      content: '/';
      display: inline-block;
      margin: 0 6px;
      color: ${({ theme: { colors } }) => colors.gray[300]};
    }

    .col-email {
      font-size: 13px;
      color: ${({ theme: { colors } }) => colors.gray[500]};
      margin-top: 4px;
      margin-bottom: 16px;
    }

    .col-grade {
      display: inline-block;
      width: auto;
    }

    .col-actions {
      position: absolute;
      bottom: 16px;
      right: 16px;
      width: auto;
    }

    .status-row {
      box-shadow: none;
      background: transparent;
      border: none;
      &:hover {
        transform: none;
      }
      td {
        text-align: center;
      }
    }
  }
`;

const ManageBtn = styled.button`
  all: unset;
  display: inline-block;
  padding: 6px 14px;
  border-radius: 6px;
  background: ${({ theme: { colors } }) => colors.secondary};
  color: ${({ theme: { colors } }) => colors.white};
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme: { colors } }) => colors.primary};
  }

  &:active {
    transform: translateY(1px);
  }

  @media ${({ theme }) => theme.mobile} {
    width: auto;
    padding: 6px 16px;
    border-radius: 20px;
    background: ${({ theme: { colors } }) => colors.primary_light};
    color: ${({ theme: { colors } }) => colors.secondary};
    font-size: 13px;
    font-weight: 700;

    &:hover {
      background: ${({ theme: { colors } }) => colors.primary_hover};
    }
  }
`;

const PaginationBar = styled.div`
  display: flex;
  max-width: 1300px;
  justify-content: center;
  padding: 16px 12px;
  border-top: 1px solid ${({ theme: { colors } }) => colors.gray[200]};

  @media ${({ theme }) => theme.mobile} {
    border-top: none;
  }
`;

const SortBtn = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 6px;
  cursor: pointer;
  color: ${({ theme: { colors } }) => colors.gray[700]};
  padding: 0 4px;

  &:hover {
    color: ${({ theme: { colors } }) => colors.secondary};
  }

  &[data-active='true'] {
    font-weight: 700;
    color: ${({ theme: { colors } }) => colors.secondary};
  }

  .arrow {
    font-style: normal;
    font-size: 10px;
    color: ${({ theme: { colors } }) => colors.secondary};
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme: { colors } }) => colors.primary_alpha};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

// ==========================================
// ⭐️ 커스텀 드롭다운 메뉴 스타일 (검색 대상 필터용)
// ==========================================
const CustomSelectWrapper = styled.div`
  position: relative;
  width: 100%;
  cursor: pointer;
  user-select: none;
`;

const SelectBox = styled.div`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid
    ${({ theme: { colors }, $isOpen }) =>
      $isOpen ? colors.secondary : colors.gray[300]};
  border-radius: 8px;
  background: ${({ theme: { colors } }) => colors.white};
  color: ${({ theme: { colors } }) => colors.gray[900]};
  font-size: 14px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:hover {
    border-color: ${({ theme: { colors }, $isOpen }) =>
      $isOpen ? colors.secondary : colors.gray[400]};
  }

  .selected-text {
    flex: 1;
  }

  .arrow {
    font-size: 10px;
    color: ${({ theme: { colors }, $isOpen }) =>
      $isOpen ? colors.secondary : colors.gray[550]};
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: ${({ $isOpen }) =>
      $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const OptionList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: ${({ theme: { colors } }) => colors.white};
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme: { colors } }) => colors.gray[300]};
    border-radius: 4px;
  }

  animation: dropdownScale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: top center;

  @keyframes dropdownScale {
    from {
      opacity: 0;
      transform: translateY(-5px) scaleY(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scaleY(1);
    }
  }
`;

const OptionItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;

  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  color: ${({ theme: { colors }, $active }) =>
    $active ? colors.secondary : colors.gray[800]};
  background: ${({ theme: { colors }, $active }) =>
    $active ? colors.primary_light : 'transparent'};

  .check {
    font-size: 14px;
    font-weight: 800;
    color: ${({ theme: { colors } }) => colors.secondary};
    animation: fadeInCheck 0.2s ease;
  }

  &:hover {
    background: ${({ theme: { colors }, $active }) =>
      $active ? colors.primary_light : colors.gray[50]};
    color: ${({ theme: { colors }, $active }) =>
      $active ? colors.secondary : colors.gray[900]};
  }

  @keyframes fadeInCheck {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const DatePickerWrapper = styled.div`
  width: 100%;

  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid ${({ theme: { colors } }) => colors.gray[300]};
    border-radius: 8px;
    outline: none;
    background: ${({ theme: { colors } }) => colors.white};
    color: ${({ theme: { colors } }) => colors.gray[900]};
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s ease;
    box-sizing: border-box;

    &:hover {
      border-color: ${({ theme: { colors } }) => colors.gray[400]};
    }
    &:focus {
      border-color: ${({ theme: { colors } }) => colors.secondary};
      box-shadow: 0 0 0 3px ${({ theme: { colors } }) => colors.primary_alpha};
    }
  }

  .react-datepicker__close-icon {
    right: 4px;
    &::after {
      background-color: ${({ theme: { colors } }) => colors.gray[400]};
      border-radius: 50%;
      color: white;
      font-size: 10px;
      padding: 4px;
    }
  }

  .react-datepicker {
    border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
    border-radius: 8px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
    font-family: inherit;
    background-color: ${({ theme: { colors } }) => colors.white};
  }

  .react-datepicker__header {
    background-color: ${({ theme: { colors } }) => colors.gray[50]};
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
    border-radius: 8px 8px 0 0;
    padding-top: 12px;
  }

  .react-datepicker__current-month {
    color: ${({ theme: { colors } }) => colors.gray[800]};
    font-size: 15px;
    font-weight: 700;
  }

  .react-datepicker__day-name {
    color: ${({ theme: { colors } }) => colors.gray[550]};
    font-weight: 600;
    margin: 4px;
  }

  .react-datepicker__day {
    color: ${({ theme: { colors } }) => colors.gray[800]};
    margin: 4px;
    border-radius: 6px;
    transition: background-color 0.1s;

    &:hover {
      background-color: ${({ theme: { colors } }) => colors.primary_light};
      color: ${({ theme: { colors } }) => colors.secondary};
    }
  }

  .react-datepicker__day--selected,
  .react-datepicker__day--in-selecting-range,
  .react-datepicker__day--in-range {
    background-color: ${({ theme: { colors } }) => colors.secondary};
    color: ${({ theme: { colors } }) => colors.white};
    font-weight: 700;

    &:hover {
      background-color: ${({ theme: { colors } }) => colors.primary};
    }
  }

  .react-datepicker__day--keyboard-selected {
    background-color: ${({ theme: { colors } }) => colors.primary_light};
    color: ${({ theme: { colors } }) => colors.secondary};
  }

  .react-datepicker__day--disabled {
    color: ${({ theme: { colors } }) => colors.gray[300]};
    &:hover {
      background-color: transparent;
      color: ${({ theme: { colors } }) => colors.gray[300]};
    }
  }
`;
