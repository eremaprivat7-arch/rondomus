'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [participants, setParticipants] = useState('');
  const [groupCount, setGroupCount] = useState(2);
  const [evenDist, setEvenDist] = useState(true);
  const [numbering, setNumbering] = useState(false);
  const [sortOrder, setSortOrder] = useState('none');
  const [results, setResults] = useState([]);
  const [adminData, setAdminData] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminGroup, setAdminGroup] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem('randomizerAdminData');
    if (saved) setAdminData(JSON.parse(saved));
    if (window.location.search.includes('admin=true')) setShowAdmin(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('randomizerAdminData', JSON.stringify(adminData));
  }, [adminData]);

  const addToAdmin = () => {
    if (!adminName.trim()) return alert('Есім енгізіңіз!');
    setAdminData([...adminData, { name: adminName.trim(), group: parseInt(adminGroup) }]);
    setAdminName('');
  };

  const removeFromAdmin = (index) => {
    const newData = [...adminData];
    newData.splice(index, 1);
    setAdminData(newData);
  };

  const distribute = () => {
    let list = participants.split('\n').map(n => n.trim()).filter(n => n);
    adminData.forEach(item => {
      if (!list.includes(item.name)) list.push(item.name);
    });
    if (list.length === 0) return alert('Тізім бос!');

    let groups = Array.from({ length: groupCount }, () => []);
    let remaining = [...list];
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
      remaining.forEach(p => {
        groups[idx].push(p);
        idx = (idx + 1) % groupCount;
      });
    } else {
      remaining.forEach(p => {
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
  };

  return (
    <div className="max-w-lg mx-auto p-5 bg-neutral-900 text-white min-h-screen">
      {!showAdmin ? (
        <>
          <h1 className="text-2xl font-bold mb-6 text-center">Рандомайзер</h1>
          <div className="bg-neutral-800 p-5 rounded-xl mb-5">
            <label className="block text-sm text-gray-400 mb-2">Список участников</label>
            <textarea
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder={"Алиби +\nВлад +\nНабиев +\nДаха +"}
              className="w-full min-h-[120px] p-3 bg-neutral-700 rounded-lg outline-none border border-neutral-600 focus:border-blue-500"
            />
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-2">Топ саны</label>
              <input
                type="number"
                value={groupCount}
                min="1"
                onChange={(e) => setGroupCount(parseInt(e.target.value))}
                className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-neutral-600"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span>Поровну во всех группах</span>
              <input type="checkbox" checked={evenDist} onChange={(e) => setEvenDist(e.target.checked)} className="w-5 h-5" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span>Порядковые номера</span>
              <input type="checkbox" checked={numbering} onChange={(e) => setNumbering(e.target.checked)} className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-2">Сортировать</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-neutral-600"
              >
                <option value="none">Нет</option>
                <option value="alpha">По алфавиту (А-Я)</option>
                <option value="reverse">По алфавиту (Я-А)</option>
              </select>
            </div>
            <button
              onClick={distribute}
              className="w-full p-4 mt-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition"
            >
              Разделить
            </button>
          </div>

          {results.length > 0 && (
            <div className="bg-neutral-800 p-5 rounded-xl">
              <h2 className="text-xl font-bold mb-4">Результаты</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((group, i) => (
                  <div key={i} className="bg-neutral-700 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-blue-400 font-bold mb-2">{i + 1} группа</h3>
                    <ul className="space-y-1">
                      {group.map((person, j) => (
                        <li key={j} className="border-b border-neutral-600 pb-1 last:border-0">
                          {numbering ? `${j + 1}. ` : ''}{person}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-neutral-800 p-5 rounded-xl border border-red-500">
          <h2 className="text-red-500 text-xl font-bold mb-4">🛠️ Админ-панель</h2>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Қатысушы есімі</label>
            <input
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Аты-жөні"
              className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-neutral-600"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Топ нөмірі</label>
            <input
              type="number"
              value={adminGroup}
              min="1"
              onChange={(e) => setAdminGroup(parseInt(e.target.value))}
              className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-neutral-600"
            />
          </div>
          <button onClick={addToAdmin} className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold">
            Қосу
          </button>

          <h3 className="mt-5 font-bold">Алдын ала бөлінгендер:</h3>
          {adminData.map((item, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-neutral-700 mt-2 rounded-lg">
              <span>{item.name} ➔ Топ {item.group}</span>
              <button onClick={() => removeFromAdmin(i)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">
                Өшіру
              </button>
            </div>
          ))}

          <button
            onClick={() => setShowAdmin(false)}
            className="w-full p-3 mt-4 bg-neutral-600 hover:bg-neutral-500 rounded-lg font-bold"
          >
            Артқа
          </button>
        </div>
      )}
    </div>
  );
}