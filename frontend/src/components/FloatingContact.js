import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPhoneAlt } from 'react-icons/fa';

const ContactDock = styled.div`
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.65rem;
`;

const PhoneNumber = styled.a`
  color: #ffffff;
  background: #0369a1;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 10px 25px rgba(3, 105, 161, 0.3);
`;

const ContactButton = styled.button`
  width: 50px;
  height: 50px;
  border: 0;
  border-radius: 50%;
  background: #16a34a;
  color: #ffffff;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(22, 163, 74, 0.35);
  font-size: 1.25rem;
`;

const FloatingContact = () => {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <ContactDock aria-label="Liên hệ nhanh">
      {showPhone && <PhoneNumber href="tel:0816151762">0816151762</PhoneNumber>}
      <ContactButton
        type="button"
        aria-label="Hiện số điện thoại"
        aria-expanded={showPhone}
        onClick={() => setShowPhone((visible) => !visible)}
        title="Gọi điện"
      >
        <FaPhoneAlt />
      </ContactButton>
    </ContactDock>
  );
};

export default FloatingContact;
