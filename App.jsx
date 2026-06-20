import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dyoskqisafdsrjtvgyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LNhjH630SHcpxEHWONtljA_XVHx_6oB';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [mode, setMode] = useState('participant'); // 'admin' or 'participant'
  const [participantId, setParticipantId] = useState(null);
  const [participantName, setParticipantName] = useState('');
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

  // URL에서 ID 파라미터 가져오기
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setParticipantId(id);
      loadData(id);
    }
  }, []);

  // 데이터 로드
  const loadData = async (id) => {
    try {
      const { data: response } = await supabase
        .from('responses')
        .select('*')
        .eq('token', id)
        .single();
      
      if (response) {
        setParticipantName(response.participant_name || '');
        setData(response.answers || data);
      }
    } catch (error) {
      console.log('New participant');
    }
  };

  // 데이터 저장
  const saveData = async () => {
    if (!participantId) return;
    
    try {
      const { error } = await supabase
        .from('responses')
        .upsert({
          token: participantId,
          participant_name: participantName,
          answers: data,
        });
      
      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Save error:', error);
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
          .checkbox { width: 16px; height: 16px; margin-right: 10px; }
          .checked::before { content: '✓'; color: #27ae60; font-weight: bold; }
          .unchecked::before { content: '○'; color: #bdc3c7; }
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

      // html2pdf 라이브러리 동적 로드
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

  // 관리자 모드 - 링크 생성
  const AdminMode = () => {
    const [generatedId, setGeneratedId] = useState('');
    const [copied, setCopied] = useState(false);

    const generateLink = () => {
      const id = 'user_' + Math.random().toString(36).substr(2, 9);
      setGeneratedId(id);
    };

    const copyLink = () => {
      const link = `${window.location.origin}?id=${generatedId}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>👨‍⚕️ 병원 브랜딩 세미나</h1>
          <h2 style={styles.subtitle}>관리자 - 참가자 링크 생성</h2>

          <div style={styles.section}>
            <button onClick={generateLink} style={styles.primaryButton}>
              새로운 참가자 링크 생성
            </button>

            {generatedId && (
              <div style={styles.resultBox}>
                <p style={styles.label}>생성된 링크:</p>
                <div style={styles.linkBox}>
                  <code style={styles.code}>
                    {window.location.origin}?id={generatedId}
                  </code>
                </div>
                <button onClick={copyLink} style={styles.secondaryButton}>
                  {copied ? '✓ 복사됨!' : '📋 링크 복사'}
                </button>
                <p style={styles.hint}>
                  이 링크를 참가자에게 공유하세요. 각 참가자는 고유한 링크를 가지므로 서로의 답변을 볼 수 없습니다.
                </p>
              </div>
            )}
          </div>

          <button onClick={() => setMode('participant')} style={styles.textButton}>
            ← 뒤로가기
          </button>
        </div>
      </div>
    );
  };

  // 참가자 모드 - 실습
  const ParticipantMode = () => {
    if (!participantId) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>👨‍⚕️ 병원 브랜딩 세미나</h1>
            <p style={styles.description}>
              참가자 이름을 입력하고 시작하세요.
            </p>
            <input
              type="text"
              placeholder="병원명을 입력하세요"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={() => setMode('admin')}
              style={{ ...styles.primaryButton, marginTop: '20px' }}
            >
              관리자 모드 (링크 생성)
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>👨‍⚕️ 병원 브랜딩 세미나</h1>
            <p style={styles.participantInfo}>병원: {participantName || '(미입력)'}</p>
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
            <button onClick={() => setMode('admin')} style={styles.textButton}>
              관리자 모드
            </button>
          </div>
        </div>
      </div>
    );
  };

  return mode === 'admin' ? <AdminMode /> : <ParticipantMode />;
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
  secondaryButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  textButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: '#3498db',
    border: '1px solid #3498db',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  resultBox: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bee3f8',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '20px',
  },
  linkBox: {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px',
    wordBreak: 'break-all',
  },
  code: {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#2c3e50',
  },
  hint: {
    fontSize: '13px',
    color: '#666',
    marginTop: '12px',
    lineHeight: '1.5',
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
