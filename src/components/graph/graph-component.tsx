'use client';

import { useNotesStore } from '@/store/notes-store';
import { useVaultStore } from '@/store/vault-store';
import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { useCallback, useEffect, useRef } from 'react';

// Регистрация расширения
cytoscape.use(coseBilkent);

interface GraphComponentProps {
  vaultId: string;
}

export default function GraphComponent({ vaultId }: GraphComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { notes } = useNotesStore();
  useVaultStore();

  const buildElements = useCallback(() => {
    const elements: ElementDefinition[] = [];

    for (const note of notes) {
      elements.push({
        data: {
          id: note.id,
          label: note.title,
        },
      });

      if (note.tags && note.tags.length > 0) {
        for (const tag of note.tags) {
          const tagNodeId = `tag-${tag.name}`;

          if (!elements.some((el) => el.data?.id === tagNodeId)) {
            elements.push({
              data: {
                id: tagNodeId,
                label: `#${tag.name}`,
                type: 'tag',
              },
            });
          }

          elements.push({
            data: {
              id: `edge-${note.id}-${tagNodeId}`,
              source: note.id,
              target: tagNodeId,
            },
          });
        }
      }
    }

    return elements;
  }, [notes]);

  useEffect(() => {
    if (!containerRef.current || !notes.length) return;
    const elements = buildElements();

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
  }, [buildElements, notes]);

  // Обновляем граф при изменении данных
  useEffect(() => {
    if (cyRef.current && notes.length > 0) {
      cyRef.current.elements().remove();
      const elements = buildElements();
      cyRef.current.add(elements);
      cyRef.current.layout({ name: 'cose-bilkent' }).run();
    }
  }, [buildElements, notes]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-muted rounded-lg"
      style={{ width: '100%', height: '500px' }}
    />
  );
}
