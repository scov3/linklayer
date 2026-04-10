'use client';

import { useNotesStore } from '@/store/notes-store';
import { useVaultStore } from '@/store/vault-store';
import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { useEffect, useRef } from 'react';

// Регистрация расширения
cytoscape.use(coseBilkent);

interface GraphComponentProps {
  vaultId: string;
}

export default function GraphComponent({ vaultId }: GraphComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { notes } = useNotesStore();
  const { currentVault } = useVaultStore();

  useEffect(() => {
    if (!containerRef.current || !notes.length) return;

    // Подготовка данных для графа
    const elements: ElementDefinition[] = [];

    // Добавляем узлы (заметки)
    notes.forEach((note) => {
      elements.push({
        data: {
          id: note.id,
          label: note.title,
        },
      });

      // Добавляем связи между заметками (если есть)
      // Пока просто добавим связи на основе тегов
      if (note.tags && note.tags.length > 0) {
        note.tags.forEach((tag) => {
          const tagNodeId = `tag-${tag.name}`;

          // Создаем узел тега, если его еще нет
          if (!elements.some((el) => el.data?.id === tagNodeId)) {
            elements.push({
              data: {
                id: tagNodeId,
                label: `#${tag.name}`,
                type: 'tag',
              },
            });
          }

          // Создаем связь между заметкой и тегом
          elements.push({
            data: {
              id: `edge-${note.id}-${tagNodeId}`,
              source: note.id,
              target: tagNodeId,
            },
          });
        });
      }
    });

    // Инициализация Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            width: 12,
            height: 12,
            shape: 'ellipse',
            'background-color': 'hsl(var(--graph-node))',
            color: '#ffffff',
            'font-size': '12px',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '100px',
          },
        },
        {
          selector: 'node[type = "tag"]',
          style: {
            'background-color': '#ef4444',
            color: '#ffffff',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1,
            'line-color': 'hsl(var(--graph-edge))',
            'target-arrow-color': 'hsl(var(--graph-edge))',
            color: '#ffffff' /* Цвет текста для ребер */,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: {
        name: 'cose-bilkent',
      },
    });

    cyRef.current = cy;

    // Обработка событий
    cy.on('tap', 'node', (event) => {
      const nodeId = event.target.id();
      // TODO: реализовать переход к заметке
      console.log('Node clicked:', nodeId);
    });

    // Очистка при размонтировании
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [notes, currentVault]);

  // Обновляем граф при изменении данных
  useEffect(() => {
    if (cyRef.current && notes.length > 0) {
      // Обновляем элементы графа
      cyRef.current.elements().remove();

      const elements: ElementDefinition[] = [];

      // Добавляем узлы (заметки)
      notes.forEach((note) => {
        elements.push({
          data: {
            id: note.id,
            label: note.title,
          },
        });

        // Добавляем связи между заметками на основе тегов
        if (note.tags && note.tags.length > 0) {
          note.tags.forEach((tag) => {
            const tagNodeId = `tag-${tag.name}`;

            // Создаем узел тега, если его еще нет
            if (!cyRef.current!.getElementById(tagNodeId).length) {
              elements.push({
                data: {
                  id: tagNodeId,
                  label: `#${tag.name}`,
                  type: 'tag',
                },
              });
            }

            // Создаем связь между заметкой и тегом
            elements.push({
              data: {
                id: `edge-${note.id}-${tagNodeId}`,
                source: note.id,
                target: tagNodeId,
              },
            });
          });
        }
      });

      cyRef.current.add(elements);
      cyRef.current.layout({ name: 'cose-bilkent' }).run();
    }
  }, [notes]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-muted rounded-lg"
      style={{ width: '100%', height: '500px' }}
    />
  );
}
