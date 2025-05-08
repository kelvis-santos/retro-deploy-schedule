'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './globals.css';

const startDate = new Date('2025-05-08');
const deployDays = [1, 4]; // Segunda (1) e Quinta (4)
const defaultNames = ['Kelvis Santos', 'Marco Nurmberg', 'Endryus Henrique', 'Lucas Salicano'];

// Função para buscar os dados do Supabase
async function fetchDeploySchedule() {
  const { data, error } = await supabase
    .from('deploy_schedule')
    .select('deploy_date, responsible_name')
    .order('deploy_date', { ascending: true });

  if (error) {
    console.error('Erro ao buscar os dados:', error);
    return [];
  }

  return data.map((item) => ({
    date: item.deploy_date,
    responsible: item.responsible_name,
  }));
}

// Função para salvar os dados no Supabase
async function saveToSupabase(names: string[]) {
  const filtered = names.filter((name) => name.trim() !== '');
  // Salvar no Supabase
  const schedule = [];
  let current = new Date(startDate);

  for (let i = 0; i < filtered.length; i++) {
    if (deployDays.includes(current.getDay())) {
      schedule.push({
        deploy_date: current.toLocaleDateString(),
        responsible_name: filtered[i],
      });
    }
    current.setDate(current.getDate() + 1);
  }

  const { error } = await supabase
    .from('deploy_schedule')
    .upsert(schedule);

  if (error) {
    console.error('Erro ao salvar os dados no Supabase:', error);
  }
}

export default function Home() {
  const [names, setNames] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('deployNames') || 'null') || defaultNames;
    }
    return defaultNames;
  });
  const [inputNames, setInputNames] = useState([...names]);
  const [newName, setNewName] = useState('');
  const [schedule, setSchedule] = useState<{ date: string; responsible: string }[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadSchedule = async () => {
      const data = await fetchDeploySchedule();
      setSchedule(data);
    };
    loadSchedule();
  }, []);

  // Função para editar os nomes
  const saveNames = async () => {
    const filtered = inputNames.filter((name) => name.trim() !== '');
    setNames(filtered);
    localStorage.setItem('deployNames', JSON.stringify(filtered));

    await saveToSupabase(filtered);

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
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <div className="window" style={{ width: 600, margin: '0 auto' }}>
        <div className="title-bar">
          <div className="title-bar-text">Deploy Schedule - Windows 95</div>
          <div className="title-bar-controls">
            <button aria-label="Close"></button>
          </div>
        </div>
        <div className="window-body">
          <p>Agenda de Deploys (Segundas e Quintas):</p>
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
  );
}
