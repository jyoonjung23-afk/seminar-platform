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
          <h2 style={styles.sectionTitle}>실습2</h2>
          <p style={styles.description}>우리 병원의 가치제안 설계하기</p>

          {[
            { key: 'q1', label: '1. 환자의 어떤 문제에서 우리 병원이 가장 강한가?', guide: '"허리디스크를 잘 본다"가 아니라 "수술과 장기 휴직은 피하고 싶지만 빠른 업무 복귀가 필요한 장시간 운전 직군의 초기·중등도 허리디스크 환자에게 강하다"' },
            { key: 'q2', label: '2. 환자는 왜 다른 병원이 아니라 우리 병원을 선택했을까?(우리 병원만의 차별성)', guide: '환자는 왜 다른 병원이 아니라 우리 병원을 선택했을까요? 진료 과정, 설명, 치료, 관리 중 무엇이 달랐나요? 그 차이로 인해 환자는 어떤 이점을 얻었나요?' },
            { key: 'q3', label: '3. 우리만의 차이는 환자에게 어떤 도움이 되었는가?', guide: '2번에서의 우리 병원 차별성은 환자에게 어떤 도움이 되었는지 적어보세요. 예를들어 원장이 직접 검사 결과를 설명한다는 차이가 있으면, 이로 인해 환자는 상태를 정확히 이해하고 치료를 결정하는데에 도움이 되었을 것입니다.' },
            { key: 'q4', label: '4. 우리 병원의 차별성을 만들어내는 구체적인 시스템은 무엇인가?', guide: '우리 병원의 차별성이 어떤 과정으로 만들어지는지 적어보세요. 예를 들어 환자가 치료 방향을 쉽게 이해할 수 있도록 MRI 결과를 원장이 직접 설명 한다거나, 치료 계획을 그림으로 안내 한다거나 하는 등 우리 만의 차별성을 만드는 시스템을 적어보세요.' },
            { key: 'q5', label: '5. 우리 병원의 차별성을 보여줄 수 있는 객관적인 근거는 무엇인가?', guide: '우리 병원의 차별성이 단순한 주장에 그치지 않도록 객관적으로 보여줄 수 있는 근거를 적어보세요. 의료진 경력, 특정 질환 진료 경험, 환자 사례, 검사·치료 프로토콜, 장비, 학술활동, 환자 후기, 운영 데이터 등 환자가 신뢰할 수 있는 근거를 작성해보세요.' },
            { key: 'q6', label: '6. 우리 병원 포지셔닝 한 문장 만들기', guide: '[상황과 문제]를 겪는 [대표 환자]에게, [병원명]은 [핵심 가치]를 제공하는 [병원 카테고리]다. [경쟁 대안]과 달리 [차별적 능력]을 갖추고 있으며, [객관적 근거]로 이를 증명한다.' },
          ].map((item) => (
            <div key={item.key} style={styles.question}>
              <label style={styles.label}>{item.label}</label>
              <p style={styles.guide}>가이드 : {item.guide}</p>
              <textarea
                value={data.practice2[item.key]}
                onChange={(e) => handleChange(`practice2.${item.key}`, e.target.value)}
                onBlur={saveDataLocal}
                style={styles.textarea}
              />
            </div>
          ))}
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
