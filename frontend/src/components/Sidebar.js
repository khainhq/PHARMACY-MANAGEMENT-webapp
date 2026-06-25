import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { BiHome, BiFile, BiUser, BiPackage, BiLock, BiLogOut, BiChevronDown, BiChevronUp, BiReceipt, BiBuildings, BiCart, BiGroup } from 'react-icons/bi';
import axios from 'axios';

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 260px;
  background: linear-gradient(135deg, #1e293b,rgb(2, 87, 53));
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
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
  margin-bottom: 2rem;
  padding: 0.25rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const Avatar = styled.img`
  width: 60px;
  height: 60px;
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
  font-size: 1.2rem;
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
  padding: 0.8rem 1rem;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  font-size: 1rem;
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
  margin-top: auto;
  padding: 0.8rem 1rem;
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

const Sidebar = () => {
  const navigate = useNavigate();
  const [isInvoiceSubMenuOpen, setInvoiceSubMenuOpen] = useState(false);
  const [isPaymentSubMenuOpen, setPaymentSubMenuOpen] = useState(false);

  const role = sessionStorage.getItem('role');

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:8000/api/auth/logout/', {}, {
        headers: { Authorization: `Token ${token}` },
      });
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  return (
    <SidebarContainer>
      <ProfileSection>
        <Avatar src="https://png.pngtree.com/png-clipart/20200721/original/pngtree-customer-service-free-avatar-user-icon-business-user-icon-users-group-png-image_4823037.jpg" alt="User Avatar" />
        <ProfileInfo>
          <Name>{role === 'Admin' ? 'Admin' : 'User'}</Name>
          <Role>{role}</Role>
        </ProfileInfo>
      </ProfileSection>

      <Menu>
        {role === 'Admin' && (
          <MenuItem to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            <BiHome /> Trang Chủ
          </MenuItem>
        )}
        {role === 'Nhân viên bán hàng' && (
          <MenuItem to="/sales-dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            <BiHome /> Trang Chủ
          </MenuItem>
        )}
        {role === 'Nhân viên quản lý sản phẩm' && (
          <MenuItem to="/product-manager-dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            <BiHome /> Trang Chủ
          </MenuItem>
        )}

        {role === 'Admin' && (
          <MenuItem to="/reports" className={({ isActive }) => (isActive ? "active" : "")}>
            <BiFile /> Báo Cáo
          </MenuItem>
        )}

        {(role === 'Nhân viên bán hàng' || role === 'Admin') && (
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
              <MenuItem to="/invoices/create" className={({ isActive }) => (isActive ? "active" : "")}>
                Tạo Hóa Đơn
              </MenuItem>
              <MenuItem to="/invoices/list" className={({ isActive }) => (isActive ? "active" : "")}>
                Danh Sách Hóa Đơn
              </MenuItem>
            </SubMenu>
            <MenuItem to="/customers" className={({ isActive }) => (isActive ? "active" : "")}>
              <BiUser /> Khách Hàng
            </MenuItem>
          </>
        )}

        {(role === 'Nhân viên quản lý sản phẩm' || role === 'Admin') && (
          <>
            <MenuItem to="/medicines" className={({ isActive }) => (isActive ? "active" : "")}>
              <BiPackage /> Thuốc
            </MenuItem>
            <MenuItem to="/suppliers" className={({ isActive }) => (isActive ? "active" : "")}>
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
              <MenuItem to="/payments/create" className={({ isActive }) => (isActive ? "active" : "")}>
                Tạo Phiếu Nhập
              </MenuItem>
              <MenuItem to="/payments/list" className={({ isActive }) => (isActive ? "active" : "")}>
                Danh Sách Phiếu Nhập
              </MenuItem>
            </SubMenu>
          </>
        )}

        {role === 'Admin' && (
          <>
            <MenuItem to="/employees" className={({ isActive }) => (isActive ? "active" : "")}>
              <BiGroup /> Nhân Viên
            </MenuItem>
            <MenuItem to="/accounts" className={({ isActive }) => (isActive ? "active" : "")}>
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