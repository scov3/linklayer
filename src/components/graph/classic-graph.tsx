'use client';

import type { Link, Note, Tag } from '@/lib/supabase/types';
import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { useCallback, useEffect, useRef } from 'react';

cytoscape.use(coseBilkent);

type NoteWithTags = Note & { tags?: Tag[] };

interface ClassicGraphProps {
  notes: NoteWithTags[];
  links: Link[];
  onNoteClick?: (noteId: string) => void;
}

export default function ClassicGraph({ notes, links, onNoteClick }: ClassicGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const buildElements = useCallback((): ElementDefinition[] => {
    const elements: ElementDefinition[] = [];
    const addedTagIds = new Set<string>();

    // Note nodes
    for (const note of notes) {
      elements.push({
        data: { id: note.id, label: note.title, type: 'note' },
      });

      // Tag nodes & edges (note → tag)
      if (note.tags) {
        for (const tag of note.tags) {
          const tagNodeId = `tag-${tag.id}`;
          if (!addedTagIds.has(tagNodeId)) {
            addedTagIds.add(tagNodeId);
            elements.push({
              data: { id: tagNodeId, label: `#${tag.name}`, type: 'tag', color: tag.color },
            });
          }
          elements.push({
            data: {
              id: `edge-tag-${note.id}-${tag.id}`,
              source: note.id,
              target: tagNodeId,
              type: 'tag-edge',
            },
          });
        }
      }
    }

    // Link edges (note → note from links table)
    for (const link of links) {
      const sourceExists = notes.some((n) => n.id === link.source_note_id);
      const targetExists = notes.some((n) => n.id === link.target_note_id);
      if (sourceExists && targetExists) {
        elements.push({
          data: {
            id: `link-${link.id}`,
            source: link.source_note_id,
            target: link.target_note_id,
            type: 'link-edge',
          },
        });
      }
    }

    return elements;
  }, [notes, links]);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = buildElements();

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        // Note nodes
        {
          selector: 'node[type = "note"]',
          style: {
            label: 'data(label)',
            width: 40,
            height: 40,
            shape: 'ellipse',
            'background-color': 'hsl(221 83% 53%)',
            color: '#ffffff',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 4,
            'text-wrap': 'ellipsis',
            'text-max-width': '90px',
            'border-width': 2,
            'border-color': 'hsl(221 83% 43%)',
          },
        },
        // Tag nodes
        {
          selector: 'node[type = "tag"]',
          style: {
            label: 'data(label)',
            width: 24,
            height: 24,
            shape: 'round-rectangle',
            'background-color': 'data(color)',
            color: '#ffffff',
            'font-size': '9px',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'ellipsis',
            'text-max-width': '70px',
          },
        },
        // Tag edges
        {
          selector: 'edge[type = "tag-edge"]',
          style: {
            width: 1,
            'line-color': '#d1d5db',
            'line-style': 'dashed',
            'target-arrow-shape': 'none',
            'curve-style': 'bezier',
            opacity: 0.6,
          },
        },
        // Link edges (note-to-note)
        {
          selector: 'edge[type = "link-edge"]',
          style: {
            width: 2,
            'line-color': 'hsl(221 83% 53%)',
            'target-arrow-color': 'hsl(221 83% 53%)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            opacity: 0.85,
          },
        },
        // Hover state
        {
          selector: 'node:active',
          style: { 'overlay-opacity': 0.15 },
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 3,
            'border-color': '#f59e0b',
          },
        },
      ],
      layout: {
        name: notes.length > 0 ? 'cose-bilkent' : 'preset',
        animate: true,
        animationDuration: 600,
      } as Parameters<Core['layout']>[0],
      userZoomingEnabled: true,
      userPanningEnabled: true,
      minZoom: 0.3,
      maxZoom: 3,
    });

    cy.on('tap', 'node[type = "note"]', (evt) => {
      const nodeId = evt.target.id() as string;
      onNoteClick?.(nodeId);
      cy.nodes().removeClass('highlighted');
      evt.target.addClass('highlighted');
    });

    cy.on('mouseover', 'node', (evt) => {
      (containerRef.current as HTMLDivElement).style.cursor = 'pointer';
      evt.target.style('opacity', 0.8);
    });

    cy.on('mouseout', 'node', (evt) => {
      (containerRef.current as HTMLDivElement).style.cursor = 'default';
      evt.target.style('opacity', 1);
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [buildElements, notes, onNoteClick]);

  if (notes.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
        <div className="text-center">
          <p className="font-medium">Нет заметок</p>
          <p className="mt-1 text-sm">Создайте заметки, чтобы увидеть граф</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border bg-card"
      style={{ height: '560px' }}
    />
  );
}
