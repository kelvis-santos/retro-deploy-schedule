'use client';
import React, { useState, useEffect, useRef } from 'react';
import './globals.css';

const startDate = new Date('2025-05-08');
const deployDays = [1, 4];
const defaultNames = ['Kelvis Santos', 'Marco Nurmberg', 'Endryus Henrique', 'Lucas Salicano'];

function generateSchedule(names: string[], count = 100) {
  const schedule: { date: string; responsible: string }[] = [];
  const current = new Date(startDate);
  let i = 0;

  while (schedule.length < count) {
    if (deployDays.includes(current.getDay())) {
      const responsible = names[i % names.length];
      schedule.push({
        date: current.toLocaleDateString('pt-BR'),
        responsible,
      });
      i++;
    }
    current.setDate(current.getDate() + 1);
  }

  return schedule;
}

export default function Home() {
  const [names, setNames] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('deployNames') || 'null') || defaultNames;
    }
    return defaultNames;
  });

  const [editing, setEditing] = useState(false);
  const [inputNames, setInputNames] = useState([...names]);
  const [newName, setNewName] = useState('');
  const [showWindow, setShowWindow] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [time, setTime] = useState(new Date());

  const schedule = generateSchedule(names);

  const windowRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
      }
    };

    const handleMouseUp = () => setDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset]);

  useEffect(() => {
    const stored = localStorage.getItem('deployNames');
    if (stored) setNames(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const saveNames = () => {
    const filtered = inputNames.filter((name) => name.trim() !== '');
    setNames([...filtered]);
    localStorage.setItem('deployNames', JSON.stringify(filtered));
    setEditing(false);
  };

  const removeName = (index: number) => {
    const copy = [...inputNames];
    copy.splice(index, 1);
    setInputNames(copy);
  };

  const addName = () => {
    const trimmed = newName.trim();
    if (trimmed && !inputNames.includes(trimmed)) {
      setInputNames([...inputNames, trimmed]);
      setNewName('');
    }
  };

  return (
    <div className="desktop">
      <div className="desktop-icons">
        <div className="icon" onClick={() => setShowWindow(true)}>
          <img src="https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-3.png" alt="Deploys" />
          <span>Deploys</span>
        </div>
      </div>

      <div className="taskbar">
        <div className="start-button" onClick={() => setShowStartMenu((v) => !v)}>
          <img src="https://win98icons.alexmeub.com/icons/png/windows-0.png" alt="Start" />
          <span className="start-label">Iniciar</span>
        </div>
        <div className="taskbar-program">Agenda de Deploys</div>
        <div className="taskbar-clock">
          {time.toLocaleDateString('pt-BR')} {time.toLocaleTimeString('pt-BR')}
        </div>
        {showStartMenu && (
          <div className="start-menu">
            <div className="start-menu-header">Windows 98</div>
            <ul className="start-menu-list">
              <li onClick={() => alert('Windows Update')}>Windows Update</li>
              <li onClick={() => alert('Abrindo programas...')}>Programs</li>
              <li onClick={() => alert('Favoritos abertos')}>Favorites</li>
              <li onClick={() => alert('Abrindo documentos...')}>Documents</li>
              <li onClick={() => alert('Abrindo configurações')}>Settings</li>
              <li onClick={() => alert('Busca iniciada')}>Find</li>
              <li onClick={() => alert('Ajuda')}>Help</li>
              <li onClick={() => alert('Executando...')}>Run...</li>
              <li onClick={() => alert('Sessão encerrada')}>Log Off</li>
              <li onClick={() => alert('Desligando...')}>Shut Down...</li>
            </ul>
          </div>
        )}
      </div>

      {showWindow && (
        <div
          ref={windowRef}
          className="window"
          style={{ width: 600, position: 'absolute', top: position.y, left: position.x, cursor: dragging ? 'url(https://cur.cursors-4u.net/cursors/cur-2/cur116.cur), auto' : 'default' }}
        >
          <div className="title-bar" onMouseDown={handleMouseDown} style={{ cursor: 'url(https://cur.cursors-4u.net/cursors/cur-2/cur116.cur), auto' }}>
            <div className="title-bar-text">Deploy Schedule - Windows 98</div>
            <div className="title-bar-controls">
              <button aria-label="Close" onClick={() => setShowWindow(false)}></button>
            </div>
          </div>
          <div className="window-body">
            <p>Agenda de Deploys (Segundas e Quintas):</p>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map(({ date, responsible }, idx) => (
                    <tr key={idx}>
                      <td>{date}</td>
                      <td>{responsible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editing ? (
              <div style={{ marginTop: 10 }}>
                <p>Editar nomes:</p>
                {inputNames.map((name, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                    <input
                      value={name}
                      onChange={(e) => {
                        const copy = [...inputNames];
                        copy[idx] = e.target.value;
                        setInputNames(copy);
                      }}
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => removeName(idx)}>Excluir</button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    placeholder="Novo nome"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button onClick={addName}>Adicionar</button>
                </div>
                <button className="button" onClick={saveNames}>Salvar</button>
              </div>
            ) : (
              <button className="button" onClick={() => {
                setInputNames(names);
                setEditing(true);
              }}>Editar Nomes</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
