import React, { useState } from 'react';
import { Button, Input } from '@kindich/shared';
import { castBySerial, SerialCastingResult, InvalidSerialInputError } from '@kindich/core';

export interface SerialCastingFormProps {
  /** Callback trả kết quả lập quẻ thành công về component cha */
  onCastSuccess: (result: SerialCastingResult) => void;
  /** Callback khi xóa hoặc làm mới form */
  onReset?: () => void;
  /** Giá trị khởi tạo nếu có */
  initialValue?: string;
}

export const SerialCastingForm: React.FC<SerialCastingFormProps> = ({
  onCastSuccess,
  onReset,
  initialValue = '',
}) => {
  const [serial, setSerial] = useState(initialValue);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Xử lý thay đổi ô nhập: Chỉ cho phép nhập các ký tự chữ số từ 0 đến 9.
   * Giữ nguyên số 0 ở đầu.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Lọc bỏ mọi ký tự không phải chữ số
    const onlyDigits = rawVal.replace(/\D/g, '');

    setSerial(onlyDigits);
    // Xóa lỗi ngay khi người dùng bắt đầu chỉnh sửa
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  /**
   * Xử lý gửi form và kích hoạt thuật toán SERIAL-MOD8-V1
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanSerial = serial.trim();

    // 1. Kiểm tra rỗng
    if (!cleanSerial) {
      setErrorMessage('Vui lòng nhập số seri tiền.');
      return;
    }

    // 2. Kiểm tra tối thiểu 2 chữ số
    if (cleanSerial.length < 2) {
      setErrorMessage('Số seri tiền phải có tối thiểu 2 chữ số (ví dụ: "08", "123456").');
      return;
    }

    try {
      // 3. Gọi thuật toán SERIAL-MOD8-V1 từ @kindich/core
      const castingResult = castBySerial(cleanSerial);
      setErrorMessage(null);
      onCastSuccess(castingResult);
    } catch (err) {
      if (err instanceof InvalidSerialInputError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Đã xảy ra lỗi không xác định khi lập quẻ. Vui lòng thử lại.');
      }
    }
  };

  /**
   * Làm mới form và xóa kết quả
   */
  const handleClear = () => {
    setSerial('');
    setErrorMessage(null);
    if (onReset) {
      onReset();
    }
  };

  return (
    <form className="serial-casting-form" onSubmit={handleSubmit} noValidate>
      <div className="serial-casting-form__field">
        <Input
          label="Dãy số seri tờ tiền đang cầm:"
          placeholder="Ví dụ: 123456 hoặc 091234"
          value={serial}
          onChange={handleInputChange}
          maxLength={16}
          helperText="Chỉ nhập các chữ số in trên tờ tiền (tối thiểu 2 chữ số, giữ nguyên số 0 ở đầu)."
          error={errorMessage || undefined}
          isRequired
          fullWidth
          size="lg"
          autoComplete="off"
        />
      </div>

      <div className="serial-casting-form__actions">
        <Button variant="primary" size="lg" type="submit" disabled={serial.length < 2}>
          Lập quẻ
        </Button>

        {serial && (
          <Button variant="outline" size="lg" type="button" onClick={handleClear}>
            Xóa & Nhập lại
          </Button>
        )}
      </div>
    </form>
  );
};
