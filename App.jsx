import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ⚠️ 여기에 당신의 Supabase 정보를 입력하세요
const SUPABASE_URL = 'https://dyoskqisafdsrjtvgyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LNhjH630SHcpxEHWOht1jA_XVhx_6oB';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [userId, setUserId] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [data, setData] = useState({
    practice1: {
      q1: '',
      q2: '',
      q3: '',
      q4: '',
    },
    practice2: {
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

  // 초기 로드: LocalStorage에서 데이터 불러오기
  useEffect(() => {
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

  // 시작하기
  const handleStart = () => {
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
          <div class="section-title">실습 1: 병원의 정체성 정의하기</div>

          <div class="question">
            <div class="q-label">1) 고객은 누구인가?</div>
            <div class="q-answer">${data.practice1.q1 || '(미기입)'}</div>
          </div>

          <div class="question">
            <div class="q-label">2) 우리는 누구인가?</div>
            <div class="q-answer">${data.practice1.q2 || '(미기입)'}</div>
          </div>

          <div class="question">
            <div class="q-label">3) 왜 우리여야 하는가?</div>
            <div class="q-answer">${data.practice1.q3 || '(미기입)'}</div>
          </div>

          <div class="question">
            <div class="q-label">4) 우리 병원 한 문장으로 정의하기</div>
            <div class="q-answer">${data.practice1.q4 || '(미기입)'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">실습 2: 병원의 일관성 갖추기</div>
          <div style="font-size: 14px; color: #666; margin-bottom: 15px;">네이버, 구글 등 외부 사이트에서 병원 정보 일관성 체크</div>

          <div class="checklist">
            <div class="checklist-item">
              <span class="${data.practice2.check1 ? 'checked' : 'unchecked'}"></span>
              정의가 동일한가?
            </div>
            <div class="checklist-item">
              <span class="${data.practice2.check2 ? 'checked' : 'unchecked'}"></span>
              주력 질환이 일치하는가?
            </div>
            <div class="checklist-item">
              <span class="${data.practice2.check3 ? 'checked' : 'unchecked'}"></span>
              환자 타겟이 일치하는가?
            </div>
            <div class="checklist-item">
              <span class="${data.practice2.check4 ? 'checked' : 'unchecked'}"></span>
              치료 철학이 일치하는가?
            </div>
            <div class="checklist-item">
              <span class="${data.practice2.check5 ? 'checked' : 'unchecked'}"></span>
              의료진 소개가 일치하는가?
            </div>
            <div class="checklist-item">
              <span class="${data.practice2.check6 ? 'checked' : 'unchecked'}"></span>
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

        {/* 실습 1 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>실습 1: 병원의 정체성 정의하기</h2>

          <div style={styles.question}>
            <label style={styles.label}>1) 고객은 누구인가?</label>
            <textarea
              value={data.practice1.q1}
              onChange={(e) => handleChange('practice1.q1', e.target.value)}
              onBlur={saveData}
              placeholder="예: 30-50대 직장인, 만성질환 환자 등"
              style={styles.textarea}
            />
          </div>

          <div style={styles.question}>
            <label style={styles.label}>2) 우리는 누구인가?</label>
            <textarea
              value={data.practice1.q2}
              onChange={(e) => handleChange('practice1.q2', e.target.value)}
              onBlur={saveData}
              placeholder="병원의 정체성, 특징 등을 설명하세요"
              style={styles.textarea}
            />
          </div>

          <div style={styles.question}>
            <label style={styles.label}>3) 왜 우리여야 하는가?</label>
            <textarea
              value={data.practice1.q3}
              onChange={(e) => handleChange('practice1.q3', e.target.value)}
              onBlur={saveData}
              placeholder="차별화 포인트, 선택 이유 등을 설명하세요"
              style={styles.textarea}
            />
          </div>

          <div style={styles.question}>
            <label style={styles.label}>4) 우리 병원 한 문장으로 정의하기</label>
            <textarea
              value={data.practice1.q4}
              onChange={(e) => handleChange('practice1.q4', e.target.value)}
              onBlur={saveData}
              placeholder="병원을 한 문장으로 정의해보세요"
              style={{ ...styles.textarea, height: '60px' }}
            />
          </div>
        </div>

        {/* 실습 2 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>실습 2: 병원의 일관성 갖추기</h2>
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
                  checked={data.practice2[item.key]}
                  onChange={(e) => {
                    handleChange(`practice2.${item.key}`, e.target.checked);
                    saveData();
                  }}
                  style={styles.checkbox}
                />
                <label style={styles.checkboxLabel}>{item.label}</label>
              </div>
            ))}
          </div>
        </div>

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
  },
  card: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '40px',
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
  subtitle: {
    fontSize: '20px',
    color: '#34495e',
    margin: '10px 0 0 0',
    fontWeight: '500',
  },
  description: {
    fontSize: '16px',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  participantInfo: {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0 0 0',
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
