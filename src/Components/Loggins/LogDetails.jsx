import React from "react";
import "./LogDetails.css";

export default function LogDetails({ setResponseRequest, setItem, item, setShowLogDetails }) {

    if (!item) return null;

    return (
        <div className="detail-overlay" >

            <div className="detail-box" >

                <h2>Əməliyyat Detalı</h2>

                <section>
                    <h3>Əsas məlumat</h3>
                    <Item label="Sənəd №: " value={item?.documentNo} />
                    <Item label="Tarix: " value={item?.historyDate} />
                    <Item label="Qeyd: " value={item?.note} />
                </section>

                <section>
                    <h3>Əməliyyat</h3>
                    <Item label="Hesab Növü: " value={item?.accountType?.name} />
                    <Item label="Tip: " value={item?.action?.desc} />
                </section>

                <section>
                    <h3>İcra edən (Növbətçi)</h3>
                    <Item label="Ad: " value={item?.personnelData?.name} />
                    <Item label="Soyad: " value={item?.personnelData?.surname} />
                    <Item label="Ata adı: " value={item?.personnelData?.fatherName} />
                    <Item label="İstifadəçi adı: " value={item?.personnelData?.username} />
                    <Item label="Rütbə: " value={item?.personnelData?.rank?.name} />
                </section>


                <section>
                    <h3>İstifadəçi</h3>
                    <Item label="Ad: " value={item?.clientData?.name} />
                    <Item label="Soyad: " value={item?.clientData?.surname} />
                    <Item label="Ata adı: " value={item?.clientData?.fatherName} />
                    <Item label="İstifadəçi adı: " value={item?.clientData?.username} />
                    <Item label="Rütbə: " value={item?.clientData?.rank?.name} />
                    <Item label="Şöbə: " value={item?.clientData?.department?.tag} />
                    <Item label="Bölmə: " value={item?.clientData?.unit?.tag} />
                </section>

                <button className="detail-close" onClick={() => {
                    setShowLogDetails(null);
                    setItem(null)
                }}>Bağla</button>

            </div>
        </div>
    );
}


function Item({ label, value }) {
    return (
        <div className="detail-item">
            <span className="detail-label">{label}</span>
            <span className="detail-value">{value || "-"}</span>
        </div>
    );
}
