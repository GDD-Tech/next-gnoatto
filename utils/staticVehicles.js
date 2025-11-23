import passeio from "@/assets/vehicles/01 Passeio.png";
import reboque1 from "@/assets/vehicles/02 Reboque Passeio 1 Eixo.png";
import reboque2 from "@/assets/vehicles/03 Reboque Passeio 2 Eixos.png";
import moto from "@/assets/vehicles/moto.png";
import onibus2 from "@/assets/vehicles/04 2C 2 Eixos.png";
import onibus3 from "@/assets/vehicles/05 3C 3 Eixos.png";
import onibus4 from "@/assets/vehicles/06 4C 4 Eixos.png";
import caminhao2 from "@/assets/vehicles/07 2C 16.png";
import caminhao22 from "@/assets/vehicles/08 2C 22.png";
import caminhao3 from "@/assets/vehicles/09 3C.png";
import caminhao4 from "@/assets/vehicles/4C.png";
import caminhao5 from "@/assets/vehicles/11 2S2 4 Eixos.png";
import c2S35Eixos from "@/assets/vehicles/2S3 5 Eixos.png";
import c3S36Eixos from "@/assets/vehicles/3S3 6 Eixos.png";
import c2C24Eixos from "@/assets/vehicles/2C2 4 Eixos.png";
import c2I35Eixos from "@/assets/vehicles/2I3 5 Eixos.png";
import c2J35Eixos from "@/assets/vehicles/2J3 5 Eixos.png";
import c3S25Eixos from "@/assets/vehicles/3S2 5 Eixos.png";
import c4S37Eixos from "@/assets/vehicles/4S3 7 Eixos.png";
import c3I36Eixos from "@/assets/vehicles/3I3 6 Eixos.png";
import c3J36Eixos from "@/assets/vehicles/3J3 6 Eixos.png";
import c3T47Eixos from "@/assets/vehicles/3T4 7 Eixos Bitrem.png";
import c3T69Eixos from "@/assets/vehicles/3T6 9 Eixos Rodotrem Tritrem.png";
import c2C35Eixos from "@/assets/vehicles/2C3 5 Eixos.png";
import c3C25Eixos from "@/assets/vehicles/3C2 5 Eixos.png";
import c3C36Eixos from "@/assets/vehicles/3C3 6 Eixos.png";
import c3D47Eixos from "@/assets/vehicles/3D4 7 Eixos.png";
import c3D69Eixos from "@/assets/vehicles/3D6 9 Eixos Rodotrem.png";


export function getVehicleData(type){
    const passeioImgList = [
      { id: 'passeio', image: passeio, type:'passeio', description: "Passeio", exportName: '2E' },
      { id: 'moto', image: moto, type:'passeio', description: "Moto", exportName: 'Moto' },
      { id: 'reboque1', image: reboque1, type:'passeio', description: "Reboque Passeio 1 Eixo", exportName: '3E' },
      { id: 'reboque2', image: reboque2, type:'passeio', description: "Reboque Passeio 2 Eixos", exportName: '4E' },
    ];
    
    const onibusImgList = [
      { id: 'onibus2', image: onibus2, type:'onibus', description: "2C 2 Eixos", exportName: '2CB' },
      { id: 'onibus3', image: onibus3, type:'onibus', description: "3C 3 Eixos", exportName: '3CB' },
      { id: 'onibus4', image: onibus4, type:'onibus', description: "4C 4 Eixos", exportName: '4CB' },
    ]
    
    const caminhaoImgList = [
      { id: 'caminhao2', image: caminhao2, type:'caminhao', description: "2C (16)", exportName: '2C' },
      { id: 'caminhao22', image: caminhao22, type:'caminhao', description: "2C (22)", exportName: '2C' },
      { id: 'caminhao3', image: caminhao3, type:'caminhao', description: "3C", exportName: '3C' },
      { id: 'caminhao4', image: caminhao4, type:'caminhao', description: "4C", exportName: '4C' },
      { id: 'caminhao5', image: caminhao5, type:'caminhao', description: "2S2 4 Eixos", exportName: '2S2' },
      { id: 'c2S35Eixos', image: c2S35Eixos, type:'caminhao', description: "2S3 5 Eixos", exportName: '2S3' },
      { id: 'c2I35Eixos', image: c2I35Eixos, type:'caminhao', description: "2I3 5 Eixos", exportName: '2I3' },
      { id: 'c2J35Eixos', image: c2J35Eixos, type:'caminhao', description: "2J3 5 Eixos", exportName: '2J3' },
      { id: 'c3S25Eixos', image: c3S25Eixos, type:'caminhao', description: "3S2 5 Eixos", exportName: '3S2' },
      { id: 'c3S36Eixos', image: c3S36Eixos, type:'caminhao', description: "3S3 6 Eixos", exportName: '3S3' },
      { id: 'c4S37Eixos', image: c4S37Eixos, type:'caminhao', description: "4S3 7 Eixos", exportName: '4S3' },
      { id: 'c3I36Eixos', image: c3I36Eixos, type:'caminhao', description: "3I3 6 Eixos", exportName: '3I3' },
      { id: 'c3J36Eixos', image: c3J36Eixos, type:'caminhao', description: "3J3 6 Eixos", exportName: '3J3' },
      { id: 'c3T47Eixos', image: c3T47Eixos, type:'caminhao', description: "3T4 7 Eixos Bitrem", exportName: '3T4' },
      { id: 'c3T69Eixos', image: c3T69Eixos, type:'caminhao', description: "3T6 9 Eixos Rodotrem Tritrem", exportName: '3T6' },
      { id: 'c2C24Eixos', image: c2C24Eixos, type:'caminhao', description: "2C2 4 Eixos", exportName: '2C2' },
      { id: 'c2C35Eixos', image: c2C35Eixos, type:'caminhao', description: "2C3 5 Eixos", exportName: '2C3' },
      { id: 'c3C25Eixos', image: c3C25Eixos, type:'caminhao', description: "3C2 5 Eixos", exportName: '3C2' },
      { id: 'c3C36Eixos', image: c3C36Eixos, type:'caminhao', description: "3C3 6 Eixos", exportName: '3C3' },
      { id: 'c3D47Eixos', image: c3D47Eixos, type:'caminhao', description: "3D4 7 Eixos", exportName: '3D4' },
      { id: 'c3D69Eixos', image: c3D69Eixos, type:'caminhao', description: "3D6 9 Eixos Rodotrem", exportName: '3D6' },
    ]

    switch (type) {
        case 'passeio':
            return passeioImgList;
        case 'onibus':
            return onibusImgList;
        case 'caminhao':
            return caminhaoImgList;
        default:
            return [];
    }
}