'use client';

import type { Link, Note, Tag } from '@/lib/supabase/types';
import {
  type SimulationLinkDatum,
  type SimulationNodeDatum,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force';
import { useCallback, useEffect, useRef, useState } from 'react';

type NoteWithTags = Note & { tags?: Tag[] };

interface PhysicsGraphProps {
  notes: NoteWithTags[];
  links: Link[];
  onNoteClick?: (noteId: string) => void;
}

interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: 'note' | 'tag';
  color: string;
  radius: number;
}

interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  id: string;
  type: 'link' | 'tag-link';
}

function truncate(text: string, maxLen = 14) {
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

export default function PhysicsGraph({ notes, links, onNoteClick }: PhysicsGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const simRef = useRef<ReturnType<typeof forceSimulation<GraphNode>> | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const [, forceRender] = useState(0);

  // Build graph data from props
  const buildGraph = useCallback(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const tagMap = new Map<string, GraphNode>();

    for (const note of notes) {
      nodes.push({
        id: note.id,
        label: note.title,
        type: 'note',
        color: '#3b82f6',
        radius: 18,
      });

      if (note.tags) {
        for (const tag of note.tags) {
          const tagId = `tag-${tag.id}`;
          if (!tagMap.has(tagId)) {
            const tagNode: GraphNode = {
              id: tagId,
              label: `#${tag.name}`,
              type: 'tag',
              color: tag.color || '#6366f1',
              radius: 10,
            };
            tagMap.set(tagId, tagNode);
            nodes.push(tagNode);
          }
          edges.push({
            id: `te-${note.id}-${tag.id}`,
            source: note.id,
            target: tagId,
            type: 'tag-link',
          });
        }
      }
    }

    // Links between notes
    for (const link of links) {
      const srcExists = nodes.some((n) => n.id === link.source_note_id);
      const tgtExists = nodes.some((n) => n.id === link.target_note_id);
      if (srcExists && tgtExists) {
        edges.push({
          id: `l-${link.id}`,
          source: link.source_note_id,
          target: link.target_note_id,
          type: 'link',
        });
      }
    }

    return { nodes, edges };
  }, [notes, links]);

  // Draw frame
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    for (const edge of edgesRef.current) {
      const src = edge.source as GraphNode;
      const tgt = edge.target as GraphNode;
      if (src.x == null || src.y == null || tgt.x == null || tgt.y == null) continue;

      ctx.beginPath();
      ctx.moveTo(src.x * dpr, src.y * dpr);
      ctx.lineTo(tgt.x * dpr, tgt.y * dpr);

      if (edge.type === 'link') {
        ctx.strokeStyle = 'rgba(59,130,246,0.7)';
        ctx.lineWidth = 2 * dpr;
        ctx.setLineDash([]);

        // Arrow
        const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
        const arrowLen = 8 * dpr;
        const ex = tgt.x * dpr - Math.cos(angle) * tgt.radius * dpr;
        const ey = tgt.y * dpr - Math.sin(angle) * tgt.radius * dpr;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(
          ex - arrowLen * Math.cos(angle - Math.PI / 6),
          ey - arrowLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          ex - arrowLen * Math.cos(angle + Math.PI / 6),
          ey - arrowLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = 'rgba(59,130,246,0.7)';
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(156,163,175,0.4)';
        ctx.lineWidth = 1 * dpr;
        ctx.setLineDash([4 * dpr, 4 * dpr]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw nodes
    for (const node of nodesRef.current) {
      if (node.x == null || node.y == null) continue;

      const isHovered = hoveredRef.current === node.id;
      const isSelected = selectedRef.current === node.id;
      const r = node.radius * dpr;
      const x = node.x * dpr;
      const y = node.y * dpr;

      // Shadow for selected
      if (isSelected) {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12 * dpr;
      }

      ctx.beginPath();
      if (node.type === 'note') {
        ctx.arc(x, y, r, 0, Math.PI * 2);
      } else {
        // Rounded rectangle for tags
        const w = (node.label.length * 5 + 8) * dpr;
        const h = 16 * dpr;
        ctx.roundRect(x - w / 2, y - h / 2, w, h, 4 * dpr);
      }
      ctx.fillStyle = isHovered ? lighten(node.color) : node.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Border
      if (isSelected || isHovered) {
        ctx.strokeStyle = isSelected ? '#f59e0b' : '#ffffff';
        ctx.lineWidth = (isSelected ? 3 : 1.5) * dpr;
        ctx.stroke();
      }

      // Label for notes
      if (node.type === 'note') {
        ctx.fillStyle = '#ffffff';
        ctx.font = `${11 * dpr}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(truncate(node.label, 10), x, y);

        // Title below node
        ctx.fillStyle = isHovered ? '#1e40af' : '#374151';
        ctx.font = `${10 * dpr}px Inter, system-ui, sans-serif`;
        ctx.fillText(truncate(node.label, 18), x, y + r + 10 * dpr);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = `${9 * dpr}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(truncate(node.label, 12), x, y);
      }
    }
  }, []);

  // Hit test
  const hitTest = useCallback((cx: number, cy: number): GraphNode | null => {
    for (const node of nodesRef.current) {
      if (node.x == null || node.y == null) continue;
      const dist = Math.hypot(cx - node.x, cy - node.y);
      const r = node.type === 'tag' ? node.radius + 8 : node.radius;
      if (dist <= r) return node;
    }
    return null;
  }, []);

  // Setup & run simulation
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const W = container.clientWidth;
    const H = 560;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const { nodes, edges } = buildGraph();
    nodesRef.current = nodes;
    edgesRef.current = edges;

    if (simRef.current) simRef.current.stop();

    const sim = forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance(80)
          .strength(0.4)
      )
      .force('charge', forceManyBody<GraphNode>().strength(-180))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide<GraphNode>((d) => d.radius + 8).strength(0.8))
      .alphaDecay(0.03)
      .on('tick', () => {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(draw);
      });

    simRef.current = sim;

    // Mouse events
    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      const hit = hitTest(x, y);
      const newHovered = hit?.id ?? null;
      if (newHovered !== hoveredRef.current) {
        hoveredRef.current = newHovered;
        canvas.style.cursor = hit ? 'pointer' : 'default';
        draw();
      }
    };

    const onClick = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      const hit = hitTest(x, y);
      if (hit?.type === 'note') {
        selectedRef.current = hit.id;
        onNoteClick?.(hit.id);
        forceRender((n) => n + 1);
        draw();
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);

    return () => {
      sim.stop();
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [buildGraph, draw, hitTest, onNoteClick]);

  if (notes.length === 0) {
    return (
      <div className="flex h-[560px] w-full items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
        <div className="text-center">
          <p className="font-medium">Нет заметок</p>
          <p className="mt-1 text-sm">Создайте заметки, чтобы увидеть граф</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas ref={canvasRef} className="w-full rounded-lg border bg-card" />
      <div className="absolute bottom-3 right-3 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
        Физический режим · d3-force
      </div>
    </div>
  );
}

function lighten(hex: string): string {
  try {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`;
  } catch {
    return hex;
  }
}
