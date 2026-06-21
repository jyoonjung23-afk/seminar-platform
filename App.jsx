import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ⚠️ 여기에 본인의 Supabase 정보를 입력하세요
const SUPABASE_URL = 'https://dyoskqisafdsrjtvgyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LNhjH630SHcpxEHWOht1jA_XVhx_6oB';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🏢 ADRESULT 로고 URL
const LOGO_URL = 'https://adresult1.s3.ap-northeast-2.amazonaws.com/%EC%95%A0%EB%93%9C%EB%A6%AC%EC%A0%88%ED%8A%B8+%ED%8C%8C%EB%B9%84%EC%BD%98png.png';

// 📅 세미나 마감 시간 설정 (2026-06-21 오후 10:00)
const SEMINAR_DEADLINE = new Date('2026-06-21T22:00:00').getTime();

export default function App() {
  const [userId, setUserId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [data, setData] = useState({
    practice1: { q1: '', q2: '', q3: '', q4: '', q5: '' },
    practice2: { q1: '', q2_alt: '', q2_diff: '', q3: '', q4: '', q5: '', q6: '' },
    practice3: {
      check1: { answer: '', memo: '' },
      check2: { answer: '', memo: '' },
      check3: { answer: '', memo: '' },
      check4: { answer: '', memo: '' },
      check5: { answer: '', memo: '' },
      check6: { answer: '', memo: '' },
    },
  });

  // 📅 날짜 제한 확인
  useEffect(() => {
    if (Date.now() > SEMINAR_DEADLINE) {
      setIsExpired(true);
    }
  }, []);

  // 💾 LocalStorage에서 로드
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedData = localStorage.getItem('seminarData');
    const savedName = localStorage.getItem('participantName');

    if (savedUserId) {
      setUserId(savedUserId);
      setIsStarted(true);
    }
    if (savedName) {
      setParticipantName(savedName);
    }
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error('데이터 로드 실패:', e);
      }
    }
  }, []);

  // 🎯 세미나 시작
  const startSeminar = () => {
    if (!participantName.trim()) {
      alert('병원명을 입력하세요!');
      return;
    }

    if (isExpired) {
      alert('세미나 접속 가능 시간이 종료되었습니다.\n(2026-06-21 오후 10:00 이후 접속 불가)');
      return;
    }

    const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(newUserId);
    setIsStarted(true);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('participantName', participantName);
  };

  // 📝 데이터 변경
  const handleChange = (path, value) => {
    const keys = path.split('.');
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  // 💾 Supabase에 저장
  const saveData = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase.from('responses').upsert(
        {
          token: userId,
          participant_name: participantName,
          answers: data,
        },
        { onConflict: 'token' }
      );

      if (error) throw error;
      console.log('✅ 데이터 저장 완료');
    } catch (error) {
      console.error('저장 실패:', error);
    }
  };

  // 💾 LocalStorage에 저장
  const saveDataLocal = () => {
    localStorage.setItem('seminarData', JSON.stringify(data));
    saveData();
  };

  useEffect(() => {
    saveDataLocal();
  }, [data]);

  // 📄 PDF 다운로드
  const downloadPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>AI 병원마케팅 세미나 결과</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { height: 40px; margin-bottom: 10px; }
          .title { font-size: 24px; font-weight: bold; color: #2c3e50; }
          .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
          .hospital-name { font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; }
          .section-title { font-size: 16px; font-weight: bold; color: #2c3e50; margin-top: 25px; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 8px; }
          .question { margin-bottom: 20px; }
          .q-label { font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
          .answer { margin-left: 10px; padding: 10px; background-color: #f5f5f5; border-left: 3px solid #3498db; }
          .page-break { page-break-after: always; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${LOGO_URL}" class="logo" alt="ADRESULT">
          <div class="title">AI 병원마케팅 세미나 by ADRESULT</div>
          <div class="subtitle">실습 결과지</div>
        </div>

        <div class="hospital-name">병원명: ${participantName}</div>

        <div class="section-title">실습1 - 우리 환자가 누구인지가 아니라, 왜 지금 우리를 선택하는지 찾아봅니다</div>
        ${generatePracticeHTML(data.practice1, [
          { key: 'q1', label: '1. 우리가 집중하고 싶은 대표 환자는 누구인가?' },
          { key: 'q2', label: '2. 무엇이 환자를 \'바로 지금\' 움직이게 했는가?' },
          { key: 'q3', label: '3. 환자는 치료를 통해 어떤 변화를 원하는가?' },
          { key: 'q4', label: '4. 환자는 무엇 때문에 우리 병원에서의 치료를 망설이고, 대신 무엇을 고려하는가?' },
          { key: 'q5', label: '5. 환자는 무엇을 확인하고, 어떤 말로 표현하는가?' },
        ])}

        <div class="page-break"></div>

        <div class="section-title">실습2 - 우리 병원의 가치제안 설계하기</div>
        ${generatePracticeHTML(data.practice2, [
          { key: 'q1', label: '1. 환자의 어떤 문제에서 우리 병원이 가장 강한가?' },
          { key: 'q2', label: '2. 환자는 왜 다른 병원이 아니라 우리 병원을 선택했을까?' },
          { key: 'q3', label: '3. 우리만의 차이는 환자에게 어떤 도움이 되었는가?' },
          { key: 'q4', label: '4. 우리 병원의 차별성을 만들어내는 구체적인 시스템은 무엇인가?' },
          { key: 'q5', label: '5. 우리 병원의 차별성을 보여줄 수 있는 객관적인 근거는 무엇인가?' },
          { key: 'q6', label: '6. 우리 병원 포지셔닝 한 문장 만들기' },
        ])}

        <div class="page-break"></div>

        <div class="section-title">실습3 - 일관성 체크</div>
        ${generateChecklistHTML(data.practice3, [
          { key: 'check1', label: '1. 병원명과 로고가 일치하는가?' },
          { key: 'check2', label: '2. 주력 질환이 일치하는가?' },
          { key: 'check3', label: '3. 환자 타겟이 일치하는가?' },
          { key: 'check4', label: '4. 의료진 소개가 일치하는가?' },
          { key: 'check5', label: '5. 병원 시설이 일치하는가?' },
          { key: 'check6', label: '6. 진료 시간/연락처/주소가 일치하는가?' },
        ])}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${participantName}_세미나결과.html`;
    link.click();
  };

  function generatePracticeHTML(practice, questions) {
    return questions
      .map(
        (item) => `
      <div class="question">
        <div class="q-label">${item.label}</div>
        <div class="answer">${practice[item.key] || '(답변 없음)'}</div>
      </div>
    `
      )
      .join('');
  }

  function generateChecklistHTML(practice3, items) {
    return items
      .map(
        (item) => `
      <div class="question">
        <div class="q-label">${item.label}</div>
        <div class="answer">
          ${practice3[item.key].answer === 'yes' ? '✓ 동일합니다' : '✗ 다릅니다'}
          ${practice3[item.key].memo ? `<br/>수정 필요사항: ${practice3[item.key].memo}` : ''}
        </div>
      </div>
    `
      )
      .join('');
  }

  // 🔄 초기화
  const resetData = () => {
    if (window.confirm('모든 데이터를 삭제하고 처음부터 시작하시겠습니까?')) {
      setIsStarted(false);
      setParticipantName('');
      setUserId('');
      setActiveTab(0);
      setData({
        practice1: { q1: '', q2: '', q3: '', q4: '', q5: '' },
        practice2: { q1: '', q2: '', q3: '', q4: '', q5: '', q6: '' },
        practice3: {
          check1: { answer: '', memo: '' },
          check2: { answer: '', memo: '' },
          check3: { answer: '', memo: '' },
          check4: { answer: '', memo: '' },
          check5: { answer: '', memo: '' },
          check6: { answer: '', memo: '' },
        },
      });
      localStorage.removeItem('userId');
      localStorage.removeItem('seminarData');
      localStorage.removeItem('participantName');
    }
  };

  // 🚫 세미나 종료 확인
  if (isExpired && !isStarted) {
    return (
      <div style={styles.container}>
        <div style={styles.expiredMessage}>
          <h2>세미나 접속 종료</h2>
          <p>2026년 6월 21일 오후 10:00 이후로는 접속할 수 없습니다.</p>
          <p>이전에 저장하신 데이터가 있다면 접속 가능합니다.</p>
        </div>
      </div>
    );
  }

  // 📱 메인 화면
  if (!isStarted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <img src={LOGO_URL} style={styles.logo} alt="ADRESULT" />
          <h1 style={styles.title}>AI 병원마케팅 세미나 by ADRESULT</h1>
          <p style={styles.description}>환자가 우리 병원을 선택하는 이유 설계하기</p>

          <input
            type="text"
            placeholder="병원명을 입력하세요"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            style={styles.input}
          />

          <button onClick={startSeminar} style={styles.primaryButton}>
            실습 시작
          </button>

          <p style={styles.notice}>
            💡 팁: 병원 전체 환자가 아닌, 핵심 질환 1개와 최근 실제로 만난 대표 환자 1명을 기준으로 작성하세요.
          </p>
        </div>
      </div>
    );
  }

  // 🎯 실습 화면
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src={LOGO_URL} style={styles.headerLogo} alt="ADRESULT" />
        <h1 style={styles.headerTitle}>AI 병원마케팅 세미나 by ADRESULT</h1>
        <p style={styles.userId}>ID: {userId}</p>
      </div>

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 0 ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab(0)}
        >
          실습1
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 1 ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab(1)}
        >
          실습2
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 2 ? styles.tabButtonActive : styles.tabButtonInactive),
          }}
          onClick={() => setActiveTab(2)}
        >
          실습3
        </button>
      </div>

      {/* 실습1 탭 */}
      {activeTab === 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>실습 1.</h2>
          <p style={styles.description}>우리 환자가 누구인지가 아니라, 왜 지금 우리를 선택하는지 찾아봅니다.</p>
          
          <div style={styles.exampleBox}>
            <p style={styles.exampleTitle}>💡 [실습1], [실습2]를 마치고 나면 이런 엔티티를 만들 수 있습니다.</p>
            <p style={styles.exampleText}>
              딸의 결혼식을 앞두고 앞니 상실을 더 이상 미룰 수 없지만, 수술 통증과 긴 회복기간을 걱정하는 60대 환자에게, ○○치과는 치료 선택과 회복 일정을 충분히 이해한 상태에서 앞니 치료를 결정할 수 있도록 돕는 치과다. 단순히 임플란트 시술만 제공하는 것과 달리, 정밀진단·치료계획 설명·보철 과정·사후관리를 하나의 과정으로 운영하며, 의료진의 관련 진료경력, 유사 환자 사례, 단계별 관리 프로토콜로 이를 증명한다.
            </p>
            <p style={styles.exampleKeywords}>
              📌 60대 여성 | 앞니 상실 | 딸 결혼식 | 틀니 사용 또는 치료 지연 | 수술 통증 | 회복기간 | 치료계획 설명 | 임플란트
            </p>
          </div>

          {/* 질문 1 */}
          <div style={styles.questionBlock}>
            <h3 style={styles.questionNumber}>1. 우리가 집중하고 싶은 대표 환자는 누구인가?</h3>
            
            <div style={styles.sectionLabel}>
              <strong style={{color: '#2c3e50'}}>[작성 항목]</strong>
            </div>
            <p style={styles.guideText}>
              연령·성별<br/>
              직업과 생활패턴<br/>
              질환이나 증상의 상태<br/>
              기존 치료 경험<br/>
              가족 등 의사결정에 영향을 미치는 사람
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#2c3e50'}}>[질문 문장]</strong>
            </div>
            <p style={styles.guideText}>
              최근 실제로 만난 환자 중, 우리 병원이 앞으로 더 많이 만나고 싶은 대표 환자 한 명은 누구인가?
            </p>

            <textarea
              value={data.practice1.q1}
              onChange={(e) => handleChange('practice1.q1', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
            />
          </div>

          {/* 질문 2 */}
          <div style={styles.questionBlock}>
            <h3 style={styles.questionNumber}>2. 무엇이 환자를 '바로 지금' 움직이게 했는가?</h3>
            
            <div style={styles.sectionLabel}>
              <strong style={{color: '#2c3e50'}}>[보조 질문]</strong>
            </div>
            <p style={styles.guideText}>
              이전부터 불편했는데 왜 이제 병원을 찾았는가?<br/>
              더 이상 미룰 수 없게 만든 사건은 무엇인가?<br/>
              증상 악화, 가족행사, 직장 문제, 검진 결과, 타 병원 치료 실패 중 무엇이 결정적이었는가?<br/>
              검색이나 전화 직전에는 무슨 일이 있었는가?
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#2c3e50'}}>[질문 문장]</strong>
            </div>
            <p style={styles.guideText}>
              환자가 더 이상 치료를 미루지 않고 병원을 찾게 만든 결정적인 사건은 무엇인가?
            </p>

            <textarea
              value={data.practice1.q2}
              onChange={(e) => handleChange('practice1.q2', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
            />
          </div>

          {/* 질문 3 */}
          <div style={styles.questionBlock}>
            <h3 style={styles.questionNumber}>3. 환자는 치료를 통해 어떤 변화를 원하는가?</h3>
            
            <div style={styles.sectionLabel}>
              <strong style={{color: '#2c3e50'}}>[작성 항목]</strong>
            </div>
            <p style={styles.guideText}>
              기능적 변화: 무엇을 다시 할 수 있어야 하는가?<br/>
              감정적 변화: 어떤 걱정과 불안에서 벗어나고 싶은가?<br/>
              사회적 변화: 가족이나 직장, 타인 앞에서 어떻게 보이고 싶은가?
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#2c3e50'}}>[질문 문장]</strong>
            </div>
            <p style={styles.guideText}>
              치료가 성공했다고 느끼려면 환자의 생활·감정·대인관계에서 무엇이 달라져야 하는가?
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#2c3e50'}}>[예]</strong>
            </div>
            <p style={styles.guideText}>
              "허리가 낫고 싶다"가 아니라<br/>
              "장거리 운전을 다시 하고, 수술 없이 빨리 업무에 복귀하며, 가족에게 부담을 주지 않고 싶다."
            </p>

            <textarea
              value={data.practice1.q3}
              onChange={(e) => handleChange('practice1.q3', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
            />
          </div>

          {/* 질문 4 */}
          <div style={styles.questionBlock}>
            <h3 style={styles.questionNumber}>4. 환자는 무엇 때문에 망설이며, 대신 무엇을 고려하는가?</h3>
            
            <div style={styles.sectionLabel}>
              <strong style={{color: '#2c3e50'}}>[보조 질문]</strong>
            </div>
            <p style={styles.guideText}>
              치료 통증이나 부작용이 걱정되는가?<br/>
              비용보다 '효과가 없을 가능성'을 더 걱정하는가?<br/>
              회복기간과 업무 중단이 부담되는가?<br/>
              이전 치료 실패 때문에 불신하는가?<br/>
              배우자나 자녀의 동의가 필요한가?<br/>
              다른 병원, 대학병원, 약, 자가관리, 치료 미루기 중 무엇을 고려하는가?
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#2c3e50'}}>[질문 문장]</strong>
            </div>
            <p style={styles.guideText}>
              환자가 예약과 치료를 망설이게 만드는 가장 큰 장벽은 무엇이며, 우리 병원 대신 어떤 대안을 고려하는가?
            </p>

            <div style={styles.noteBox}>
              <strong style={{color: '#2c3e50'}}>[참고]</strong>
              <p style={styles.noteText}>
                경쟁자는 반드시 다른 병원만은 아닙니다. '아무것도 하지 않고 미루기'도 매우 강력한 경쟁 대안입니다.
              </p>
            </div>

            <textarea
              value={data.practice1.q4}
              onChange={(e) => handleChange('practice1.q4', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
            />
          </div>

          {/* 질문 5 */}
          <div style={styles.questionBlock}>
            <h3 style={styles.questionNumber}>5. 환자는 무엇을 확인하고, 어떤 말로 표현하는가?</h3>
            
            <div style={styles.sectionLabel}>
              <strong style={{color: '#2c3e50'}}>[보조 질문]</strong>
            </div>
            <p style={styles.guideText}>
              병원을 고를 때 반드시 확인하는 세 가지는?<br/>
              의사의 경력, 치료사례, 장비, 비용, 후기, 회복기간 중 무엇이 중요한가?<br/>
              무엇을 보면 신뢰가 생기는가?<br/>
              반대로 무엇을 보면 병원을 제외하는가?<br/>
              네이버·유튜브·지도에서 어떤 검색어를 입력하는가?<br/>
              상담실에서 가장 먼저 묻는 질문은 무엇인가?<br/>
              최종적으로 치료를 결정하면서 어떤 말을 하는가?
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#2c3e50'}}>[질문 문장]</strong>
            </div>
            <p style={styles.guideText}>
              환자는 어떤 기준과 증거를 보고 병원을 선택하며, 검색과 상담에서 실제로 어떤 표현을 사용하는가?
            </p>

            <textarea
              value={data.practice1.q5}
              onChange={(e) => handleChange('practice1.q5', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
            />
          </div>
        </div>
      )}

      {/* 실습2 탭 */}
      {activeTab === 1 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>실습 2.</h2>
          <p style={styles.description}>우리 병원의 가치제안 설계하기</p>

          {/* 질문 1 */}
          <div style={styles.questionBlock}>
            <h3 style={styles.questionNumber}>1. 환자의 어떤 문제에서 우리 병원이 가장 강한가?</h3>
            
            <div style={styles.sectionLabel}>
              <strong style={{color: '#666'}}>[나쁜 답 예시]</strong>
            </div>
            <p style={styles.guideText}>
              허리디스크를 잘 본다.
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#666'}}>[좋은 답 예시]</strong>
            </div>
            <p style={styles.guideText}>
              수술과 장기휴직은 피하고 싶지만 빠른 업무복귀가 필요한 장시간 운전 직군의 초기·중등도 허리디스크 환자에게 강하다.
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#666'}}>[질문 문장]</strong>
            </div>
            <p style={styles.guideText}>
              앞에서 정의한 환자의 상황·두려움·원하는 변화 중, 우리 병원이 가장 잘 해결할 수 있는 한 가지는 무엇인가?
            </p>

            <textarea
              value={data.practice2.q1}
              onChange={(e) => handleChange('practice2.q1', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
            />
          </div>

          {/* 질문 2 - 표 형식 */}
          <div style={styles.questionBlock}>
            <h3 style={styles.questionNumber}>2. 환자가 비교하는 대안과 우리 병원의 실제 차이는 무엇인가?</h3>
            
            <div style={styles.sectionLabel}>
              <strong style={{color: '#666'}}>[질문 문장]</strong>
            </div>
            <p style={styles.guideText}>
              환자가 우리 병원 대신 선택할 수 있는 대안은 무엇이며, 그 대안에는 없고 우리에게 실제로 있는 차이는 무엇인가?
            </p>

            <div style={styles.tableBox}>
              <div style={styles.tableRow}>
                <div style={styles.tableHeaderLeft}>[대안 예시]</div>
                <div style={styles.tableHeaderRight}>[차이 예시]</div>
              </div>
              <div style={styles.tableRow}>
                <div style={styles.tableContent}>
                  인근 경쟁병원<br/>
                  대학병원<br/>
                  다른 치료 방식<br/>
                  약이나 자가관리<br/>
                  치료를 미루는 것<br/>
                  가격이 더 저렴한 병원
                </div>
                <div style={styles.tableContent}>
                  의료진의 특정 경험과 전문 분야<br/>
                  진단 방식<br/>
                  치료계획 수립 방식<br/>
                  협진 구조<br/>
                  상담과 설명 방식<br/>
                  예약 및 진료 속도<br/>
                  통증 및 회복 관리<br/>
                  사후관리 체계
                </div>
              </div>
            </div>

            <div style={styles.noteBox}>
              <strong style={{color: '#666'}}>[참고]</strong>
              <p style={styles.noteText}>
                핵심은 "우리가 잘한다"가 아니라 "대안과 비교했을 때 무엇이 실제로 다른가"입니다.
              </p>
            </div>

            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50'}}>우리 병원의 대안:</label>
            <textarea
              value={data.practice2.q2_alt}
              onChange={(e) => handleChange('practice2.q2_alt', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
              placeholder="환자가 선택할 수 있는 대안을 적어주세요"
            />

            <label style={{display: 'block', marginBottom: '8px', marginTop: '15px', fontWeight: 'bold', color: '#2c3e50'}}>우리의 차이:</label>
            <textarea
              value={data.practice2.q2_diff}
              onChange={(e) => handleChange('practice2.q2_diff', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
              placeholder="대안에는 없고 우리에게 있는 차이를 적어주세요"
            />
          </div>

          {/* 질문 3 */}
          <div style={styles.questionBlock}>
            <h3 style={styles.questionNumber}>3. 우리만의 차이는 환자에게 어떤 가치가 되는가?</h3>
            
            <div style={styles.sectionLabel}>
              <strong style={{color: '#666'}}>[작성 항목]</strong>
            </div>
            <p style={styles.guideText}>
              우리는 ______하기 때문에, 환자는 ______할 수 있다.
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#666'}}>[예]</strong>
            </div>
            <p style={styles.guideText}>
              전문의가 직접 영상검사를 설명하기 때문에<br/>
              → 환자는 자신의 상태와 치료 선택지를 이해하고 결정할 수 있다.<br/>
              <br/>
              치료 단계를 미리 안내하기 때문에<br/>
              → 환자는 회복기간과 업무 일정을 계획할 수 있다.<br/>
              <br/>
              수술과 비수술 치료를 함께 검토하기 때문에<br/>
              → 환자는 한 가지 치료만 강요받는다는 불안을 줄일 수 있다.
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#666'}}>[질문 문장]</strong>
            </div>
            <p style={styles.guideText}>
              우리 병원의 차별적 능력은 환자의 어떤 두려움을 줄이고, 어떤 원하는 변화를 가능하게 하는가?
            </p>

            <textarea
              value={data.practice2.q3}
              onChange={(e) => handleChange('practice2.q3', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
            />
          </div>

          {/* 질문 4 */}
          <div style={styles.questionBlock}>
            <h3 style={styles.questionNumber}>4. 그 가치를 만들어내는 구체적인 시스템은 무엇인가?</h3>
            
            <div style={styles.sectionLabel}>
              <strong style={{color: '#666'}}>[보조 질문]</strong>
            </div>
            <p style={styles.guideText}>
              초진부터 치료 결정까지 어떤 순서로 진행되는가?<br/>
              환자의 불안을 줄이기 위해 무엇을 설명하는가?<br/>
              치료 전후 어떤 관리를 제공하는가?<br/>
              의료진 개인의 능력이 아니라 병원 시스템으로 반복 가능한가?<br/>
              환자가 직접 체감하는 순간은 언제인가?
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#666'}}>[질문 문장]</strong>
            </div>
            <p style={styles.guideText}>
              우리가 약속하는 가치를 매번 일관되게 제공하기 위해 갖추고 있는 진단·상담·치료·사후관리 시스템은 무엇인가?
            </p>

            <textarea
              value={data.practice2.q4}
              onChange={(e) => handleChange('practice2.q4', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
            />
          </div>

          {/* 질문 5 */}
          <div style={styles.questionBlock}>
            <h3 style={styles.questionNumber}>5. 환자가 이 주장을 믿게 만드는 근거는 무엇인가?</h3>
            
            <div style={styles.sectionLabel}>
              <strong style={{color: '#666'}}>[근거의 예]</strong>
            </div>
            <p style={styles.guideText}>
              의료진의 자격과 구체적인 진료경력<br/>
              특정 질환 또는 치료의 실제 경험<br/>
              표준화된 검사·상담·사후관리 프로토콜<br/>
              유사 환자 사례<br/>
              환자 후기에서 반복적으로 등장하는 표현<br/>
              객관적으로 확인할 수 있는 장비와 시설<br/>
              치료 후 추적관리 기록<br/>
              외부기관 인증이나 학술활동<br/>
              실제 가능한 범위의 객관적 수치
            </p>

            <div style={styles.sectionLabel}>
              <strong style={{color: '#666'}}>[질문 문장]</strong>
            </div>
            <p style={styles.guideText}>
              우리 병원의 차별적 가치가 단순한 주장이 아니라는 것을 보여줄 수 있는 검증 가능한 근거는 무엇인가?
            </p>

            <textarea
              value={data.practice2.q5}
              onChange={(e) => handleChange('practice2.q5', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
            />
          </div>

          {/* 포지셔닝 한 문장 - 표 형식 */}
          <div style={styles.questionBlock}>
            <h3 style={{fontSize: '15px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '15px', margin: '0 0 15px 0'}}>
              📌 우리 병원 포지셔닝 한 문장
            </h3>

            <div style={styles.tableBox}>
              <div style={styles.tableRow}>
                <div style={styles.tableHeaderLeft}>[가이드]</div>
                <div style={styles.tableHeaderRight}>[포지셔닝 한 문장]</div>
              </div>
              <div style={styles.tableRow}>
                <div style={styles.tableContent}>
                  <strong style={{color: '#666'}}>[상황과 문제]</strong>를 겪는<br/>
                  <strong style={{color: '#666'}}>[대표 환자]</strong>에게,<br/>
                  <strong style={{color: '#666'}}>[병원명]</strong>은 <strong style={{color: '#666'}}>[핵심 가치]</strong>을<br/>
                  제공하는 <strong style={{color: '#666'}}>[병원 카테고리]</strong>다.<br/>
                  <br/>
                  <strong style={{color: '#666'}}>[경쟁 대안]</strong>과 달리<br/>
                  <strong style={{color: '#666'}}>[차별적 능력]</strong>을 갖추고 있으며,<br/>
                  <strong style={{color: '#666'}}>[객관적 근거]</strong>로 이를<br/>
                  증명한다.
                </div>
                <div style={styles.tableContent}>
                  ________한 상황에<br/>
                  놓인 ________ 환자에게,<br/>
                  우리 병원은<br/>
                  ________을 통해<br/>
                  ________할 수 있도록<br/>
                  돕는 병원이다.<br/>
                  <br/>
                  다른 대안과 달리<br/>
                  우리는 ________하며,<br/>
                  이는 ________으로<br/>
                  증명할 수 있다.
                </div>
              </div>
            </div>

            <textarea
              value={data.practice2.q6}
              onChange={(e) => handleChange('practice2.q6', e.target.value)}
              onBlur={saveDataLocal}
              style={styles.textarea}
              placeholder="우리 병원 포지셔닝을 한 문장으로 적어주세요"
            />
          </div>
        </div>
      )}

      {/* 실습3 탭 */}
      {activeTab === 2 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>실습3</h2>
          <p style={styles.description}>일관성 체크</p>
          <p style={styles.notice}>네이버, 구글 등 외부 사이트에서 병원 정보가 모두 일치하는지 확인하세요.</p>

          <div style={styles.checklist}>
            {[
              { key: 'check1', label: '1. 병원명과 로고가 일치하는가?' },
              { key: 'check2', label: '2. 주력 질환이 일치하는가?' },
              { key: 'check3', label: '3. 환자 타겟이 일치하는가?' },
              { key: 'check4', label: '4. 의료진 소개가 일치하는가?' },
              { key: 'check5', label: '5. 병원 시설이 일치하는가?' },
              { key: 'check6', label: '6. 진료 시간/연락처/주소가 일치하는가?' },
            ].map((item) => (
              <div key={item.key} style={styles.checkItem}>
                <p style={styles.checkLabel}>{item.label}</p>
                <div style={styles.checkOptions}>
                  <label style={styles.checkOption}>
                    <input
                      type="radio"
                      name={item.key}
                      value="yes"
                      checked={data.practice3[item.key].answer === 'yes'}
                      onChange={() => handleChange(`practice3.${item.key}.answer`, 'yes')}
                    />
                    ✓ 동일합니다
                  </label>
                  <label style={styles.checkOption}>
                    <input
                      type="radio"
                      name={item.key}
                      value="no"
                      checked={data.practice3[item.key].answer === 'no'}
                      onChange={() => handleChange(`practice3.${item.key}.answer`, 'no')}
                    />
                    ✗ 다릅니다
                  </label>
                </div>
                <textarea
                  placeholder="수정 필요사항"
                  value={data.practice3[item.key].memo}
                  onChange={(e) => handleChange(`practice3.${item.key}.memo`, e.target.value)}
                  onBlur={saveDataLocal}
                  style={styles.memoTextarea}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 버튼들 */}
      <div style={styles.buttonGroup}>
        <button onClick={downloadPDF} style={styles.primaryButton}>
          📄 PDF 다운로드
        </button>
        <button onClick={resetData} style={styles.secondaryButton}>
          🔄 다른 병원 시작
        </button>
      </div>
    </div>
  );
}

// 🎨 스타일
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  logo: {
    height: '60px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '10px 0',
  },
  description: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '30px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginBottom: '20px',
    boxSizing: 'border-box',
  },
  primaryButton: {
    backgroundColor: '#3498db',
    color: '#fff',
    padding: '12px 30px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px',
    marginBottom: '10px',
  },
  secondaryButton: {
    backgroundColor: '#95a5a6',
    color: '#fff',
    padding: '12px 30px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  notice: {
    fontSize: '12px',
    color: '#e74c3c',
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#fff5f5',
    borderRadius: '5px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #3498db',
  },
  headerLogo: {
    height: '40px',
    marginBottom: '10px',
  },
  headerTitle: {
    fontSize: '24px',
    color: '#2c3e50',
    margin: '0',
  },
  userId: {
    fontSize: '12px',
    color: '#999',
    margin: '8px 0 0 0',
  },
  tabs: {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: '2px solid #ddd',
    gap: '10px',
  },
  tabButton: {
    padding: '12px 20px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    borderBottom: '3px solid transparent',
  },
  tabButtonActive: {
    color: '#3498db',
    borderBottom: '3px solid #3498db',
    fontWeight: 'bold',
  },
  tabButtonInactive: {
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  question: {
    marginBottom: '25px',
  },
  questionBlock: {
    marginBottom: '35px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  questionNumber: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '15px',
    margin: '0 0 15px 0',
  },
  sectionLabel: {
    marginTop: '12px',
    marginBottom: '6px',
    fontSize: '12px',
    color: '#666',
    fontWeight: 'normal',
  },
  guideText: {
    fontSize: '12px',
    color: '#666',
    margin: '0 0 12px 0',
    lineHeight: '1.5',
  },
  noteBox: {
    backgroundColor: '#f0f8ff',
    border: '1px solid #cce5ff',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '12px',
  },
  noteText: {
    fontSize: '12px',
    color: '#666',
    margin: '5px 0 0 0',
    lineHeight: '1.5',
  },
  tableBox: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '15px',
  },
  tableRow: {
    display: 'flex',
  },
  tableHeaderLeft: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: '12px',
    fontWeight: 'bold',
    color: '#666',
    fontSize: '12px',
    borderRight: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
  },
  tableHeaderRight: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: '12px',
    fontWeight: 'bold',
    color: '#666',
    fontSize: '12px',
    borderBottom: '1px solid #ddd',
  },
  tableContent: {
    flex: 1,
    padding: '12px',
    fontSize: '12px',
    color: '#666',
    lineHeight: '1.6',
    borderRight: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#2c3e50',
  },
  guide: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic',
    marginBottom: '8px',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '3px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    minHeight: '100px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
  },
  memoTextarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    minHeight: '60px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
  },
  checklist: {
    backgroundColor: '#fff',
  },
  checkItem: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '5px',
  },
  checkLabel: {
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#2c3e50',
  },
  checkOptions: {
    display: 'flex',
    gap: '20px',
    marginBottom: '10px',
  },
  checkOption: {
    fontSize: '14px',
    cursor: 'pointer',
  },
  buttonGroup: {
    textAlign: 'center',
    marginTop: '30px',
  },
  exampleBox: {
    backgroundColor: '#e8f4f8',
    border: '2px solid #3498db',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '25px',
  },
  exampleTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  exampleText: {
    fontSize: '12px',
    color: '#333',
    lineHeight: '1.6',
    marginBottom: '10px',
  },
  exampleKeywords: {
    fontSize: '11px',
    color: '#666',
    backgroundColor: '#fff',
    padding: '8px',
    borderRadius: '5px',
    margin: '0',
  },
  expiredMessage: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    color: '#e74c3c',
  },
};
