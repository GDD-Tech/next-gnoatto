'use client'
import { useState } from "react";
import MainHeader from "@/components/main-header/MainHeader";
import ImageLoader from "@/components/video-player/ImageLoader";

export default function Main() {
    const [registros, setRegistros] = useState([]);
    const [imagens, setImagens] = useState({});
    const [resetRequest, setResetRequest] = useState(false);

    function loadZipData(result) {
        const records = result?.tempRegistros ?? [];
        const images = result?.tempImagens ?? {};
        setRegistros(records);
        setImagens(images);
    }

    return (
        <>
            <MainHeader onLoadRecords={loadZipData} onResetRequest={() => setResetRequest(true)} />
            <ImageLoader loadedRecords={registros} loadedImages={imagens} resetRequest={resetRequest} onResetHandled={() => setResetRequest(false)} />
        </>
    );
}
