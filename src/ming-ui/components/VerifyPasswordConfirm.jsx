import React, { useState } from 'react';
import { Dialog, VerifyPasswordInput } from 'ming-ui';
import { verifyPassword } from 'src/util';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { func, number, string, bool } from 'prop-types';

export default function VerifyPasswordConfirm(props) {
  const {
    confirmType = 'primary',
    width = 480,
    title,
    description,
    isRequired,
    allowNoVerify = false,
    closeImageValidation,
    onOk = () => {},
    onCancel,
  } = props;
  const [password, setPassword] = useState('');
  const [isNoneVerification, setIsNoneVerification] = useState(false);

  function handleConfirm() {
    if (isRequired && (!password || !password.trim())) {
      alert(_l('请输入密码'), 3);
      return;
    }

    verifyPassword({
      password,
      isNoneVerification,
      closeImageValidation,
      success: () => {
        onCancel();
        onOk(password);
      },
    });
  }
  return (
    <Dialog
      visible
      className="verifyPasswordConfirm"
      width={width}
      overlayClosable={false}
      title={title || _l('安全验证')}
      description={description}
      onOk={handleConfirm}
      onCancel={onCancel}
      confirm={confirmType}
    >
      <VerifyPasswordInput
        showSubTitle={false}
        autoFocus={true}
        isRequired={isRequired}
        allowNoVerify={allowNoVerify}
        onChange={({ password, isNoneVerification }) => {
          setPassword(password);
          setIsNoneVerification(isNoneVerification);
        }}
      />
    </Dialog>
  );
}

VerifyPasswordConfirm.propTypes = {
  width: number,
  title: string,
  description: string,
  isRequired: bool,
  closeImageValidation: bool,
  onOk: func,
  onCancel: func,
};

VerifyPasswordConfirm.confirm = (props = {}) =>
  functionWrap(VerifyPasswordConfirm, { ...props, closeFnName: 'onCancel' });
