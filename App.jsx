import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ⚠️ 여기에 당신의 Supabase 정보를 입력하세요
const SUPABASE_URL = 'https://dyoskqisafdsrjtvgyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LNhjH630SHcpxEHWOht1jA_XVhx_6oB';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 📅 세미나 마감 시간 설정 (2026-06-21 오후 10:00)
const SEMINAR_DEADLINE = new Date('2026-06-21T22:00:00').getTime();

export default function App() {
  const [userId, setUserId] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [data, setData] = useState({
    practice1: {
      q1: '',
      q2: '',
      q3: '',
      q4: '',
      q5: '',
    },
    practice2: {
      q1: '',
      q2: '',
      q3: '',
      q4: '',
      q5: '',
      q6: '',
      q7: '',
      q8: '',
      q9: '',
    },
    practice3: {
      check1: false,
      check2: false,
      check3: false,
      check4: false,
      check5: false,
      check6: false,
    },
  });
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);

  // 초기 로드: 날짜 확인 + LocalStorage 로드
  useEffect(() => {
    const now = new Date().getTime();
    if (now > SEMINAR_DEADLINE) {
      setIsExpired(true);
      return;
    }

    const savedUserId = localStorage.getItem('seminar_userId');
    const savedName = localStorage.getItem('seminar_name');
    const savedData = localStorage.getItem('seminar_data');

    if (savedUserId) {
      setUserId(savedUserId);
      setParticipantName(savedName || '');
      if (savedData) {
        setData(JSON.parse(savedData));
      }
      setIsStarted(true);
    }
  }, []);

  // 시작하기 (날짜 체크)
  const handleStart = () => {
    const now = new Date().getTime();
    if (now > SEMINAR_DEADLINE) {
      setIsExpired(true);
      return;
    }

    if (!participantName.trim()) {
      alert('병원명을 입력해주세요!');
      return;
    }

    const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
    setUserId(newUserId);
    setIsStarted(true);

    // LocalStorage에 저장
    localStorage.setItem('seminar_userId', newUserId);
    localStorage.setItem('seminar_name', participantName);
  };

  // 데이터 저장 (LocalStorage + Supabase)
  const saveData = async () => {
    if (!userId) return;

    // LocalStorage에 저장
    localStorage.setItem('seminar_data', JSON.stringify(data));

    // Supabase에도 백업 저장
    try {
      await supabase.from('responses').upsert({
        token: userId,
        participant_name: participantName,
        answers: data,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Supabase save error:', error);
    }
  };

  // 데이터 변경
  const handleChange = (path, value) => {
    setData(prev => {
      const keys = path.split('.');
      let obj = { ...prev };
      let current = obj;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return obj;
    });
  };

  // PDF 생성
  const generatePDF = async () => {
    setGenerating(true);

    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { border-bottom: 2px solid #2c3e50; padding-bottom: 20px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #2c3e50; }
          .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
          .section { margin: 30px 0; }
          .section-title { font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 15px; border-left: 4px solid #3498db; padding-left: 10px; }
          .question { margin: 15px 0; }
          .q-label { font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
          .q-answer { background-color: #ecf0f1; padding: 10px; border-radius: 4px; min-height: 40px; white-space: pre-wrap; }
          .checklist { margin: 15px 0; }
          .checklist-item { margin: 10px 0; }
          .checked::before { content: '✓'; color: #27ae60; font-weight: bold; margin-right: 8px; }
          .unchecked::before { content: '○'; color: #bdc3c7; margin-right: 8px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #bdc3c7; font-size: 12px; color: #666; }
        </style>

        <div class="header">
          <div class="title">병원 브랜딩 세미나</div>
          <div class="subtitle">병원: ${participantName || '(미기입)'}</div>
          <div class="subtitle">작성일: ${new Date().toLocaleDateString('ko-KR')}</div>
        </div>

        <div class="section">
          <div class="section-title">고객 정의</div>
          <div class="question">
            <div class="q-label">1) 가장 많이 오는 환자는?</div>
            <div class="q-answer">${data.practice1.q1 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">2) 환자는 어떤 순간에 우리를 찾는가?</div>
            <div class="q-answer">${data.practice1.q2 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">3) 우리의 환자는 무엇을 가장 두려워하는가?</div>
            <div class="q-answer">${data.practice1.q3 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">4) 환자는 무엇을 원하는가?</div>
            <div class="q-answer">${data.practice1.q4 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">5) 환자가 병원에 와서 가장 자주 하는 말은?</div>
            <div class="q-answer">${data.practice1.q5 || '(미기입)'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">우리 병원 정의</div>
          <div class="question">
            <div class="q-label">1) 우리가 가장 잘 보는 질환은?</div>
            <div class="q-answer">${data.practice2.q1 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">2) 치료 철학</div>
            <div class="q-answer">${data.practice2.q2 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">3) 숫자로 표현하는 우리 병원</div>
            <div class="q-answer">${data.practice2.q3 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">4) 의료진의 강점</div>
            <div class="q-answer">${data.practice2.q4 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">5) 병원 시설의 강점</div>
            <div class="q-answer">${data.practice2.q5 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">6) 환자가 가장 만족하는 부분</div>
            <div class="q-answer">${data.practice2.q6 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">7) 경쟁병원 대신 우리 병원을 선택하는 이유</div>
            <div class="q-answer">${data.practice2.q7 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">8) 우리 병원에 맞지 않는 환자는 누구인가?</div>
            <div class="q-answer">${data.practice2.q8 || '(미기입)'}</div>
          </div>
          <div class="question">
            <div class="q-label">9) 우리 병원 한 문장으로 정의하기</div>
            <div class="q-answer">${data.practice2.q9 || '(미기입)'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">일관성 체크</div>
          <div style="font-size: 14px; color: #666; margin-bottom: 15px;">네이버, 구글 등 외부 사이트에서 병원 정보 일관성 체크</div>
          <div class="checklist">
            <div class="checklist-item">
              <span class="${data.practice3.check1 ? 'checked' : 'unchecked'}"></span>
              정의가 동일한가?
            </div>
            <div class="checklist-item">
              <span class="${data.practice3.check2 ? 'checked' : 'unchecked'}"></span>
              주력 질환이 일치하는가?
            </div>
            <div class="checklist-item">
              <span class="${data.practice3.check3 ? 'checked' : 'unchecked'}"></span>
              환자 타겟이 일치하는가?
            </div>
            <div class="checklist-item">
              <span class="${data.practice3.check4 ? 'checked' : 'unchecked'}"></span>
              치료 철학이 일치하는가?
            </div>
            <div class="checklist-item">
              <span class="${data.practice3.check5 ? 'checked' : 'unchecked'}"></span>
              의료진 소개가 일치하는가?
            </div>
            <div class="checklist-item">
              <span class="${data.practice3.check6 ? 'checked' : 'unchecked'}"></span>
              병원의 정보가 일치하는가?
            </div>
          </div>
        </div>

        <div class="footer">
          <p>이 문서는 병원 브랜딩 세미나 실습을 위해 생성되었습니다.</p>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `병원브랜딩_${participantName || '참가자'}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      };

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        window.html2pdf().set(opt).from(element).save();
        setGenerating(false);
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('PDF error:', error);
      setGenerating(false);
    }
  };

  // 🔒 마감 화면
  if (isExpired) {
    return (
      <div style={styles.container}>
        <div style={styles.expiredCard}>
          <div style={styles.expiredIcon}>⏰</div>
          <h1 style={styles.expiredTitle}>세미나 기간이 종료되었습니다</h1>
          <p style={styles.expiredMessage}>
            죄송합니다. 세미나 마감일(2026년 6월 21일 오후 10:00)이 지나 더 이상 이용할 수 없습니다.
          </p>
          <p style={styles.expiredSubtext}>
            세미나 중에 이미 다운로드하신 PDF 파일은 계속 참고하실 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // 초기 화면 (병원명 입력)
  if (!isStarted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>👨‍⚕️ 병원 브랜딩 세미나</h1>
          <p style={styles.description}>
            병원명을 입력하고 실습을 시작하세요.
          </p>
          <input
            type="text"
            placeholder="병원명을 입력하세요"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
            style={styles.input}
            autoFocus
          />
          <button onClick={handleStart} style={{ ...styles.primaryButton, marginTop: '20px' }}>
            실습 시작
          </button>
        </div>
      </div>
    );
  }

  // 실습 화면
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>👨‍⚕️ 병원 브랜딩 세미나</h1>
          <p style={styles.participantInfo}>병원: {participantName}</p>
        </div>

        {/* 탭 메뉴 */}
        <div style={styles.tabContainer}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 0 ? styles.tabButtonActive : styles.tabButtonInactive),
            }}
            onClick={() => setActiveTab(0)}
          >
            고객 정의
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 1 ? styles.tabButtonActive : styles.tabButtonInactive),
            }}
            onClick={() => setActiveTab(1)}
          >
            우리 병원 정의
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 2 ? styles.tabButtonActive : styles.tabButtonInactive),
            }}
            onClick={() => setActiveTab(2)}
          >
            일관성 체크
          </button>
        </div>

        {/* 고객 정의 탭 */}
        {activeTab === 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>고객 정의</h2>

            <div style={styles.question}>
              <label style={styles.label}>1) 가장 많이 오는 환자는?</label>
              <span style={styles.hint}>(연령, 성별, 직업, 생활패턴 등)</span>
              <textarea
                value={data.practice1.q1}
                onChange={(e) => handleChange('practice1.q1', e.target.value)}
                onBlur={saveData}
                style={styles.textarea}
              />
            </div>

            <div style={styles.question}>
              <label style={styles.label}>2) 환자는 어떤 순간에 우리를 찾는가?</label>
              <textarea
                value={data.practice1.q2}
                onChange={(e) => handleChange('practice1.q2', e.target.value)}
                onBlur={saveData}
                style={styles.textarea}
              />
            </div>

            <div style={styles.question}>
              <label style={styles.label}>3) 우리의 환자는 무엇을 가장 두려워하는가?</label>
              <textarea
                value={data.practice1.q3}
                onChange={(e) => handleChange('practice1.q3', e.target.value)}
                onBlur={saveData}
                style={styles.textarea}
              />
            </div>

            <div style={styles.question}>
              <label style={styles.label}>4) 환자는 무엇을 원하는가?</label>
              <textarea
                value={data.practice1.q4}
                onChange={(e) => handleChange('practice1.q4', e.target.value)}
                onBlur={saveData}
                style={styles.textarea}
              />
            </div>

            <div style={styles.question}>
              <label style={styles.label}>5) 환자가 병원에 와서 가장 자주 하는 말은?</label>
              <textarea
                value={data.practice1.q5}
                onChange={(e) => handleChange('practice1.q5', e.target.value)}
                onBlur={saveData}
                style={styles.textarea}
              />
            </div>
          </div>
        )}

        {/* 우리 병원 정의 탭 */}
        {activeTab === 1 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>우리 병원 정의</h2>

            {[
              { key: 'q1', label: '1) 우리가 가장 잘 보는 질환은?', hint: '(1~2개)' },
              { key: 'q2', label: '2) 치료 철학', hint: '' },
              { key: 'q3', label: '3) 숫자로 표현하는 우리 병원', hint: '' },
              { key: 'q4', label: '4) 의료진의 강점', hint: '(전문성 - 논문발표, 키닥터 등)' },
              { key: 'q5', label: '5) 병원 시설의 강점', hint: '' },
              { key: 'q6', label: '6) 환자가 가장 만족하는 부분', hint: '' },
              { key: 'q7', label: '7) 경쟁병원 대신 우리 병원을 선택하는 이유', hint: '' },
              { key: 'q8', label: '8) 우리 병원에 맞지 않는 환자는 누구인가?', hint: '' },
              { key: 'q9', label: '9) 우리 병원 한 문장으로 정의하기', hint: '' },
            ].map((item) => (
              <div key={item.key} style={styles.question}>
                <label style={styles.label}>{item.label}</label>
                {item.hint && <span style={styles.hint}>{item.hint}</span>}
                <textarea
                  value={data.practice2[item.key]}
                  onChange={(e) => handleChange(`practice2.${item.key}`, e.target.value)}
                  onBlur={saveData}
                  style={styles.textarea}
                />
              </div>
            ))}
          </div>
        )}

        {/* 일관성 체크 탭 */}
        {activeTab === 2 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>일관성 체크</h2>
            <p style={styles.description}>
              네이버, 구글 등에서 병원명을 검색하여 나오는 정보들이 모두 일치하는지 확인하세요.
            </p>

            <div style={styles.checklist}>
              {[
                { key: 'check1', label: '정의가 동일한가?' },
                { key: 'check2', label: '주력 질환이 일치하는가?' },
                { key: 'check3', label: '환자 타겟이 일치하는가?' },
                { key: 'check4', label: '치료 철학이 일치하는가?' },
                { key: 'check5', label: '의료진 소개가 일치하는가?' },
                { key: 'check6', label: '병원의 정보가 일치하는가?' },
              ].map((item) => (
                <div key={item.key} style={styles.checklistItem}>
                  <input
                    type="checkbox"
                    checked={data.practice3[item.key]}
                    onChange={(e) => {
                      handleChange(`practice3.${item.key}`, e.target.checked);
                      saveData();
                    }}
                    style={styles.checkbox}
                  />
                  <label style={styles.checkboxLabel}>{item.label}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 저장 상태 */}
        {saved && (
          <div style={styles.savedNotification}>
            ✓ 저장되었습니다
          </div>
        )}

        {/* 버튼 */}
        <div style={styles.buttonGroup}>
          <button
            onClick={generatePDF}
            disabled={generating}
            style={styles.primaryButton}
          >
            {generating ? '생성 중...' : '📄 PDF 다운로드'}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('seminar_userId');
              localStorage.removeItem('seminar_name');
              localStorage.removeItem('seminar_data');
              setIsStarted(false);
              setParticipantName('');
              setUserId(null);
              setActiveTab(0);
            }}
            style={styles.textButton}
          >
            다른 병원 시작
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20px',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    maxWidth: '900px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '40px',
  },
  expiredCard: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '60px 40px',
    textAlign: 'center',
  },
  expiredIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  expiredTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#e74c3c',
    marginBottom: '20px',
  },
  expiredMessage: {
    fontSize: '16px',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  expiredSubtext: {
    fontSize: '14px',
    color: '#999',
    fontStyle: 'italic',
  },
  header: {
    marginBottom: '30px',
    borderBottom: '2px solid #e8eef5',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '0 0 10px 0',
  },
  participantInfo: {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0 0 0',
  },
  description: {
    fontSize: '16px',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '2px solid #e8eef5',
  },
  tabButton: {
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '6px 6px 0 0',
    transition: 'all 0.3s',
  },
  tabButtonActive: {
    backgroundColor: '#3498db',
    color: 'white',
    borderBottom: '3px solid #3498db',
  },
  tabButtonInactive: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '20px',
    borderLeft: '4px solid #3498db',
    paddingLeft: '12px',
  },
  question: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '5px',
  },
  hint: {
    fontSize: '13px',
    color: '#999',
    display: 'block',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    height: '100px',
    resize: 'vertical',
  },
  checklist: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginRight: '12px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '15px',
    color: '#333',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '30px',
  },
  primaryButton: {
    flex: 1,
    padding: '14px 20px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  textButton: {
    padding: '14px 20px',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: '#3498db',
    border: '1px solid #3498db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  savedNotification: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
};
