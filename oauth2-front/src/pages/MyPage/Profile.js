/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

const container = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 500px;
`;

const imgBox = css`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #dbdbdb;
    border-radius: 50%;
    width: 200px;
    height: 200px;
    overflow: hidden;
    cursor: pointer;
`;

const img = css`
    width: 100%;
`;

const fileInput = css`
    display: none;
`;

const Profile = () => {
    useEffect(() => {
        const iamport = document.createElement("script");
        iamport.src = "https://cdn.iamport.kr/v1/iamport.js";
        document.head.appendChild(iamport);
        return () => {
            document.head.removeChild(iamport);
        }
    });

    const [ imgFile, setImgFile ] = useState();
    const [ profileImgUrl, setProfileImgUrl ] = useState();
    const fileRef = useRef();


    const principal = useQuery(["principal"], async () => {
        const option = {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        }
        const response = await axios.get("http://localhost:8080/account/principal", option);
        setProfileImgUrl("http://localhost:8080/image/profile/" + response.data.profileImg);
        return response;
    });

    const profileImgSubmit = useMutation(async () => {
        const formData = new FormData();
        formData.append("profileImg", imgFile);
        const option = {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                "Content-Type": "multipart/form-data"
            }
        }
        const response = await axios.post("http://localhost:8080/account/profile/img", formData, option);
        return response;
    },{
        onSuccess: () => {
            principal.refetch();
        }
    });

    const profileImgChangeHandle = () => {
        fileRef.current.click();

    }

    const profileImgFileChangeHandle = (e) => {
        setImgFile(e.target.files[0]);
        
        const fileReader = new FileReader();

        fileReader.readAsDataURL(e.target.files[0]);
        
        fileReader.onload = (e) => {
            setProfileImgUrl(e.target.result);
        }
        
        e.target.value = null;
    }

    const onClickPayment = () => {
        if (!window.IMP) return;
        /* 1. 가맹점 식별하기 */
        const { IMP } = window;
        IMP.init("imp17188442"); // 가맹점 식별코드
    
        /* 2. 결제 데이터 정의하기 */
        const data = {
          pg: "kakaopay", // PG사 : https://portone.gitbook.io/docs/sdk/javascript-sdk/payrq#undefined-1 참고
          pay_method: "kakaopay", // 결제수단
          merchant_uid: `mid_${new Date().getTime()}`, // 주문번호
          amount: 1000, // 결제금액
          name: "아임포트 결제 데이터 분석", // 주문명
          buyer_name: "홍길동", // 구매자 이름
          buyer_tel: "01012341234", // 구매자 전화번호
          buyer_email: "example@example", // 구매자 이메일
          buyer_addr: "신사동 661-16", // 구매자 주소
          buyer_postcode: "06018", // 구매자 우편번호
        };
    
        /* 4. 결제 창 호출하기 */
        IMP.request_pay(data, (response) => {
            const { success, error_msg } = response;
    
            if (success) {
                alert("결제 성공");
            } else {
                alert(`결제 실패: ${error_msg}`);
            }
        });
    };

    

    
    
    return (
        <div css={container}>
            <div css={imgBox} onClick={profileImgChangeHandle}>
                <img css={img} src={profileImgUrl} alt="" />
                <input css={fileInput} type="file" onChange={profileImgFileChangeHandle} ref={fileRef}/>
            </div>
            <button onClick={() => profileImgSubmit.mutate()}>이미지 저장</button>
            <button onClick={onClickPayment}>결제하기</button>
        </div>
    );
};

export default Profile;