import React, { useState } from 'react';
import api from '../../../api';
import './ExportModal.css';

const ExportModal = ({ setShowExportModal, setResponseRequest, filters }) => {

  const requestFields = {
    reqRank: false,
    reqFullName: false,
    reqPosition: false,
    reqUsername: false,
    reqAccountType: false,
    reqDepartment: false,
    reqUnit: false,
    reqStatus: false,
    reqSerialNumber: false,
    reqMark: false,
    reqCapacity: false,
    reqRegisterCheck: false,
    reqUpdateDate: false,
    reqCreateDate: false,
    reqPhoneNumber: false,
    reqPassword: false,
    reqNote: false,
  };

  const requestFieldsInput = {
    reqRank: "Rütbə",
    reqFullName: "Ad Soyad Ata adı",
    reqPosition: "Vəzifə",
    reqUsername: "İstifadəçi adı",
    reqAccountType: "Hesab növü",
    reqDepartment: "İdarə",
    reqUnit: "Bölmə",
    reqStatus: "Status",
    reqSerialNumber: "Seriya nömrəsi",
    reqMark: "Marka",
    reqCapacity: "Həcm",
    reqRegisterCheck: "Qeydiyyat",
    reqUpdateDate: "Yenilənmə tarixi",
    reqCreateDate: "Yaradılma tarixi",
    reqPhoneNumber: "Telefon nömrəsi",
    reqPassword: "Parol",
    reqNote: "Qeyd",
  };

  const [format, setFormat] = useState(requestFields);

  const toggleField = (key) => {
    setFormat(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const readBlobError = (blob) => {
    return new Promise((resolve) => {
      if (!(blob instanceof Blob)) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(JSON.parse(reader.result));
        } catch {
          resolve(null);
        }
      };
      reader.readAsText(blob);
    });
  };

  const exportToExcel = async () => {
    try {
      const body = {
        searchClientRequest: filters,
        dynamicFieldRequest: format
      };

      const token = localStorage.getItem('myUserDutyToken');

      const res = await api.post(
        '/admin/client/exportAsExcel',
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      if (!res?.data || res.data.size === 0) {
        setResponseRequest(prev => ({
          ...prev,
          showResponse: true,
          title: "⚠️ Məlumat tapılmadı",
          message: "Seçilmiş sahələr üzrə heç bir məlumat mövcud deyil"
        }));
        return;
      }

      const contentType = res.headers['content-type'];

      if (contentType?.includes('application/json')) {
        const parsedError = await readBlobError(res.data);

        setResponseRequest(prev => ({
          ...prev,
          showResponse: true,
          title: "❌ Excel yaradıla bilmədi",
          message:
            parsedError?.errorDescription ||
            parsedError?.message ||
            "Server xətası baş verdi"
        }));
        return;
      }

      const blob = new Blob(
        [res.data],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'exported_data.xlsx';
      link.click();

      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "✅ Excel uğurla endirildi",
        message: "Fayl cihazınıza uğurla yükləndi!"
      }));

      setShowExportModal(false);
    }
    catch (err) {
      let errorMessage = "Naməlum xəta baş verdi";

      if (err?.response?.data instanceof Blob) {
        const parsed = await readBlobError(err.response.data);
        errorMessage =
          parsed?.errorDescription ||
          parsed?.message ||
          errorMessage;
      } else {
        errorMessage =
          err?.response?.data?.errorDescription ||
          err?.message ||
          errorMessage;
      }

      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Excel-ə ixrac edilərkən xəta baş verdi",
        message: errorMessage
      }));

      console.error(err);
    }
  };

  return (
    <div className="export-overlay">
      <div className="export-box">
        <h3>📥 Export sahələri seç</h3>

        <div className="checkbox-grid">
          {Object.keys(format).map((key) => (
            <label key={key} className="checkbox-item">
              <input
                type="checkbox"
                checked={format[key]}
                onChange={() => toggleField(key)}
              />
              <span>{requestFieldsInput[key]}</span>
            </label>
          ))}
        </div>

        <div className="export-actions">
          <button
            className="btn cancel"
            onClick={() => setShowExportModal(false)}
          >
            Bağla
          </button>

          <button
            className="btn export"
            onClick={exportToExcel}
          >
            Excel endir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
