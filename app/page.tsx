'use client';
import { useState, useEffect } from 'react';

interface AdminItem {
  name: string;
  group: number;
}

export default function Home() {
  const [participants, setParticipants] = useState<string>('');
  const [groupCount, setGroupCount] = useState<number>(2);
  const [evenDist, setEvenDist] = useState<boolean>(true);
  const [numbering, setNumbering] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<string>('none');
  const [results, setResults] = useState<string[][]>([]);
  const [adminData, setAdminData] = useState<AdminItem[]>([]);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [adminName, setAdminName] = useState<string>('');
  const [adminGroup, setAdminGroup] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('randomizerAdminData');
    if (saved) setAdminData(JSON.parse(saved));
    if (typeof window !== 'undefined' && window.location.search.includes('admin=true')) {
      setShowAdmin(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('randomizerAdminData', JSON.stringify(adminData));
  }, [adminData]);

  const addToAdmin = () => {
    if (!adminName.trim()) return alert('Есім енгізіңіз!');
    setAdminData([...adminData, { name: adminName.trim(), group: parseInt(String(adminGroup)) }]);
    setAdminName('');
  };

  const removeFromAdmin = (index: number) => {
    const newData = [...adminData];
    newData.splice(index, 1);
    setAdminData(newData);
  };

  const distribute = () => {
    setIsLoading(true);
    setResults([]);

    setTimeout(() => {
      let list = participants.split('\n').map((n: string) => n.trim()).filter((n: string) => n);
      adminData.forEach(item => {
        if (!list.includes(item.name)) list.push(item.name);
      });
      if (list.length === 0) {
        setIsLoading(false);
        return alert('Тізім бос!');
      }

      const groups: string[][] = Array.from({ length: groupCount }, () => []);
      const remaining: string[] = [...list];
      adminData.forEach(item => {
        const idx = item.group - 1;
        if (idx >= 0 && idx < groupCount) {
          groups[idx].push(item.name);
          const pos = remaining.indexOf(item.name);
          if (pos > -1) remaining.splice(pos, 1);
        }
      });

      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }

      if (evenDist) {
        let idx = 0;
        remaining.forEach((p: string) => {
          groups[idx].push(p);
          idx = (idx + 1) % groupCount;
        });
      } else {
        remaining.forEach((p: string) => {
          const minSize = Math.min(...groups.map(g => g.length));
          const available = groups.map((g, i) => g.length === minSize ? i : -1).filter(i => i !== -1);
          const randomIdx = available[Math.floor(Math.random() * available.length)];
          groups[randomIdx].push(p);
        });
      }

      groups.forEach(g => {
        if (sortOrder === 'alpha') g.sort((a, b) => a.localeCompare(b));
        if (sortOrder === 'reverse') g.sort((a, b) => b.localeCompare(a));
      });

      setResults(groups);
      setIsLoading(false);
    }, 600);
  };

  return (
    <>
      <div className="floating-icons">
        <span>✨</span>
        <span>🎲</span>
        <span>⚡</span>
        <span>🎯</span>
        <span>💫</span>
      </div>

      <div className="container-main">
        {!showAdmin ? (
          <>
            <h1 className="header-title">Рандомайзер</h1>
            <p className="header-subtitle">· Раздели участников ·</p>

            <div className="glass p-6" style={{ marginBottom: 20 }}>
              <label className="label">Список участников</label>
              <textarea
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder={"Алиби +\nВлад +\nНабиев +\nДаха +"}
                className="input-field"
              />

              <div className="mt-6">
                <label className="label">Топ саны</label>
                <input
                  type="number"
                  value={groupCount}
                  min="1"
                  onChange={(e) => setGroupCount(parseInt(e.target.value) || 1)}
                  className="input-field"
                />
              </div>

              <div className="switch-wrapper">
                <span>Поровну во всех группах</span>
                <label className="switch">
                  <input type="checkbox" checked={evenDist} onChange={(e) => setEvenDist(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="switch-wrapper">
                <span>Порядковые номера</span>
                <label className="switch">
                  <input type="checkbox" checked={numbering} onChange={(e) => setNumbering(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="mt-4">
                <label className="label">Сортировать</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="input-field"
                >
                  <option value="none">Нет</option>
                  <option value="alpha">По алфавиту (А-Я)</option>
                  <option value="reverse">По алфавиту (Я-А)</option>
                </select>
              </div>

              <button
                onClick={distribute}
                disabled={isLoading}
                className="btn-primary mt-6"
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? '⏳ Бөлінуде...' : '⚡ Разделить'}
              </button>
            </div>

            {results.length > 0 && (
              <div className="glass p-6">
                <h2 className="section-title">🎯 Результаты</h2>
                <div className="results-grid">
                  {results.map((group, i) => (
                    <div key={i} className="result-card">
                      <div className="result-title">{i + 1} группа</div>
                      {group.length === 0 ? (
                        <div className="empty-state">Бос</div>
                      ) : (
                        group.map((person, j) => (
                          <div key={j} className="result-item" style={{ animationDelay: `${j * 0.05}s` }}>
                            {numbering ? `${j + 1}. ` : ''}{person}
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="glass admin-panel p-6">
            <h2 className="admin-title">🛠️ Админ-панель</h2>

            <div className="mb-4">
              <label className="label">Қатысушы есімі</label>
              <input
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Аты-жөні"
                className="input-field"
              />
            </div>

            <div className="mb-4">
              <label className="label">Топ нөмірі</label>
              <input
                type="number"
                value={adminGroup}
                min="1"
                onChange={(e) => setAdminGroup(parseInt(e.target.value) || 1)}
                className="input-field"
              />
            </div>

            <button onClick={addToAdmin} className="btn-primary">
              ➕ Қосу
            </button>

            <h3 className="admin-subtitle">Алдын ала бөлінгендер:</h3>
            {adminData.length === 0 ? (
              <p className="empty-state">Әзірге дерек жоқ</p>
            ) : (
              adminData.map((item, i) => (
                <div key={i} className="admin-item">
                  <span><b>{item.name}</b> <span style={{ color: 'rgba(255,255,255,0.4)' }}>➔</span> Топ {item.group}</span>
                  <button onClick={() => removeFromAdmin(i)} className="btn-danger">
                    Өшіру
                  </button>
                </div>
              ))
            )}

            <button
              onClick={() => setShowAdmin(false)}
              className="btn-primary btn-secondary mt-5"
            >
              ← Артқа
            </button>
          </div>
        )}
      </div>
    </>
  );
}