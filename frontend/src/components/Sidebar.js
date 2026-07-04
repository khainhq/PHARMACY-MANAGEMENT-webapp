import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BiHome,
  BiFile,
  BiUser,
  BiPackage,
  BiLock,
  BiLogOut,
  BiChevronDown,
  BiChevronUp,
  BiReceipt,
  BiBuildings,
  BiCart,
  BiGroup,
} from 'react-icons/bi';
import axios from 'axios';

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 260px;
  background: linear-gradient(135deg, #1e293b, rgb(2, 87, 53));
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #475569 #1e293b;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #475569;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: #1e293b;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.25rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const Avatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  margin-right: 1rem;
  border: 2px solid #10b981;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.span`
  font-weight: bold;
  font-size: 1.05rem;
`;

const Role = styled.span`
  font-size: 0.9rem;
  color: #6ee7b7;
`;

const Menu = styled.div`
  flex: 1;
`;

const MenuItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.58rem 0.82rem;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 0.34rem;
  font-size: 0.95rem;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &.active {
    background-color: #10b981;
    color: #fff;
    transform: scale(1.05);
  }

  &:hover {
    background-color: #475569;
    transform: scale(1.02);
  }

  svg {
    margin-right: 1rem;
    font-size: 1.2rem;
  }
`;

const SubMenu = styled.div`
  margin-left: 1.5rem;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  border-left: 2px solid #475569;
  padding-left: 1rem;
`;

const LogoutButton = styled.div`
  margin-top: 0.55rem;
  padding: 0.68rem 0.85rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #b91c1c;
    transform: scale(1.05);
  }
`;

const ROLE_KEYS = {
  ADMIN: 'admin',
  SALES: 'sales',
  PRODUCT_MANAGER: 'product_manager',
};

const ROLE_LABELS = {
  [ROLE_KEYS.ADMIN]: 'Admin',
  [ROLE_KEYS.SALES]: 'Nhân viên bán hàng',
  [ROLE_KEYS.PRODUCT_MANAGER]: 'Nhân viên quản lý sản phẩm',
};

export const normalizeRole = (role) => {
  if (!role) return '';

  const normalizedRole = role.trim().toLowerCase();

  if (normalizedRole === 'admin') return ROLE_KEYS.ADMIN;
  if (
    normalizedRole === 'sales' ||
    normalizedRole === 'nhân viên bán hàng'
  ) {
    return ROLE_KEYS.SALES;
  }
  if (
    normalizedRole === 'product_manager' ||
    normalizedRole === 'product manager' ||
    normalizedRole === 'nhân viên quản lý sản phẩm' ||
    normalizedRole === 'nhân viên quản lí sản phẩm'
  ) {
    return ROLE_KEYS.PRODUCT_MANAGER;
  }

  return normalizedRole;
};

const Sidebar = () => {
  const navigate = useNavigate();
  const [isInvoiceSubMenuOpen, setInvoiceSubMenuOpen] = useState(false);
  const [isPaymentSubMenuOpen, setPaymentSubMenuOpen] = useState(false);

  const role = sessionStorage.getItem('role');
  const roleKey = normalizeRole(role);
  const roleLabel = ROLE_LABELS[roleKey] || role || 'Người dùng';
  const isAdmin = roleKey === ROLE_KEYS.ADMIN;
  const isSales = roleKey === ROLE_KEYS.SALES;
  const isProductManager = roleKey === ROLE_KEYS.PRODUCT_MANAGER;

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:8000/api/auth/logout/', {}, {
        headers: { Authorization: `Token ${token}` },
      });
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/');
    }
  };

  return (
    <SidebarContainer>
      <ProfileSection>
        <Avatar src="https://png.pngtree.com/png-clipart/20200721/original/pngtree-customer-service-free-avatar-user-icon-business-user-icon-users-group-png-image_4823037.jpg" alt="User Avatar" />
        <ProfileInfo>
          <Name>{isAdmin ? 'Admin' : 'User'}</Name>
          <Role>{roleLabel}</Role>
        </ProfileInfo>
      </ProfileSection>

      <Menu>
        {isAdmin && (
          <MenuItem to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            <BiHome /> Trang Chủ
          </MenuItem>
        )}
        {isSales && (
          <MenuItem to="/sales-dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            <BiHome /> Trang Chủ
          </MenuItem>
        )}
        {isProductManager && (
          <MenuItem to="/product-manager-dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            <BiHome /> Trang Chủ
          </MenuItem>
        )}

        {isAdmin && (
          <MenuItem to="/reports" className={({ isActive }) => (isActive ? 'active' : '')}>
            <BiFile /> Báo Cáo
          </MenuItem>
        )}

        {(isSales || isAdmin) && (
          <>
            <MenuItem
              as="div"
              onClick={() => setInvoiceSubMenuOpen(!isInvoiceSubMenuOpen)}
              style={{ cursor: 'pointer' }}
            >
              <BiReceipt /> Hóa Đơn
              {isInvoiceSubMenuOpen ? <BiChevronUp style={{ marginLeft: 'auto' }} /> : <BiChevronDown style={{ marginLeft: 'auto' }} />}
            </MenuItem>
            <SubMenu isOpen={isInvoiceSubMenuOpen}>
              <MenuItem to="/invoices/create" className={({ isActive }) => (isActive ? 'active' : '')}>
                Tạo Hóa Đơn
              </MenuItem>
              <MenuItem to="/invoices/list" className={({ isActive }) => (isActive ? 'active' : '')}>
                Danh Sách Hóa Đơn
              </MenuItem>
            </SubMenu>
            <MenuItem to="/customers" className={({ isActive }) => (isActive ? 'active' : '')}>
              <BiUser /> Khách Hàng
            </MenuItem>
          </>
        )}

        {(isProductManager || isAdmin) && (
          <>
            <MenuItem to="/medicines" className={({ isActive }) => (isActive ? 'active' : '')}>
              <BiPackage /> Thuốc
            </MenuItem>
            <MenuItem to="/suppliers" className={({ isActive }) => (isActive ? 'active' : '')}>
              <BiBuildings /> Nhà Cung Cấp
            </MenuItem>
            <MenuItem
              as="div"
              onClick={() => setPaymentSubMenuOpen(!isPaymentSubMenuOpen)}
              style={{ cursor: 'pointer' }}
            >
              <BiCart /> Phiếu Nhập
              {isPaymentSubMenuOpen ? <BiChevronUp style={{ marginLeft: 'auto' }} /> : <BiChevronDown style={{ marginLeft: 'auto' }} />}
            </MenuItem>
            <SubMenu isOpen={isPaymentSubMenuOpen}>
              <MenuItem to="/payments/create" className={({ isActive }) => (isActive ? 'active' : '')}>
                Tạo Phiếu Nhập
              </MenuItem>
              <MenuItem to="/payments/list" className={({ isActive }) => (isActive ? 'active' : '')}>
                Danh Sách Phiếu Nhập
              </MenuItem>
            </SubMenu>
          </>
        )}

        {isAdmin && (
          <>
            <MenuItem to="/employees" className={({ isActive }) => (isActive ? 'active' : '')}>
              <BiGroup /> Nhân Viên
            </MenuItem>
            <MenuItem to="/accounts" className={({ isActive }) => (isActive ? 'active' : '')}>
              <BiLock /> Tài Khoản
            </MenuItem>
          </>
        )}
      </Menu>

      <LogoutButton onClick={handleLogout}>
        <BiLogOut /> Đăng Xuất
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;
