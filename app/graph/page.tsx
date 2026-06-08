'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GitBranch, Loader2 } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number;
}

interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export default function GraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch('/api/graph');
        const json = await res.json();
        const rawNodes = json.data?.nodes || [];
        const rawEdges = json.data?.edges || [];

        const graphNodes: GraphNode[] = rawNodes.map(
          (n: Record<string, unknown>, i: number) => ({
            id: String(n.id),
            label: String(n.label || n.title || 'Node'),
            type: String(n.type || 'item'),
            x: 400 + (Math.random() - 0.5) * 300,
            y: 300 + (Math.random() - 0.5) * 200,
            vx: 0,
            vy: 0,
            connections: 0,
          })
        );

        const graphEdges: GraphEdge[] = rawEdges.map((e: Record<string, string>) => ({
          source: String(e.sourceItemId || e.source),
          target: String(e.targetItemId || e.target),
          relation: String(e.relation || 'related'),
        }));

        // Count connections
        for (const edge of graphEdges) {
          const s = graphNodes.find((n) => n.id === edge.source);
          const t = graphNodes.find((n) => n.id === edge.target);
          if (s) s.connections++;
          if (t) t.connections++;
        }

        setNodes(graphNodes);
        setEdges(graphEdges);
        nodesRef.current = graphNodes;
      } catch {
        setNodes([]);
        setEdges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const currentNodes = nodesRef.current;

    // Simple force simulation
    for (const node of currentNodes) {
      // Center gravity
      node.vx += (w / 2 - node.x) * 0.0005;
      node.vy += (h / 2 - node.y) * 0.0005;

      // Repulsion between nodes
      for (const other of currentNodes) {
        if (other.id === node.id) continue;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 150) {
          node.vx += (dx / dist) * 0.5;
          node.vy += (dy / dist) * 0.5;
        }
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const s = currentNodes.find((n) => n.id === edge.source);
      const t = currentNodes.find((n) => n.id === edge.target);
      if (!s || !t) continue;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 100) * 0.001;
      s.vx += (dx / dist) * force;
      s.vy += (dy / dist) * force;
      t.vx -= (dx / dist) * force;
      t.vy -= (dy / dist) * force;
    }

    // Apply velocity with damping
    for (const node of currentNodes) {
      node.vx *= 0.9;
      node.vy *= 0.9;
      node.x += node.vx;
      node.y += node.vy;
      // Bounds
      node.x = Math.max(30, Math.min(w - 30, node.x));
      node.y = Math.max(30, Math.min(h - 30, node.y));
    }

    // Draw edges
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (const edge of edges) {
      const s = currentNodes.find((n) => n.id === edge.source);
      const t = currentNodes.find((n) => n.id === edge.target);
      if (!s || !t) continue;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
    }

    // Draw nodes
    for (const node of currentNodes) {
      const r = 8 + Math.min(node.connections * 2, 12);
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = node.id === selectedNode?.id ? '#f59e0b' : '#f97316';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#0f172a';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      const label = node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label;
      ctx.fillText(label, node.x, node.y + r + 14);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [edges, selectedNode]);

  useEffect(() => {
    if (nodes.length > 0) {
      nodesRef.current = nodes;
      animRef.current = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes, draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const node of nodesRef.current) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < 15) {
        setSelectedNode(node);
        return;
      }
    }
    setSelectedNode(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-yellow" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow/10">
          <GitBranch className="h-6 w-6 text-yellow" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">Knowledge Graph</h1>
          <p className="text-sm text-muted">
            {nodes.length} nodes · {edges.length} connections
          </p>
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="rounded-xl border border-line bg-panel p-12 text-center">
          <GitBranch className="mx-auto h-12 w-12 text-muted" />
          <h2 className="mt-4 text-lg font-bold text-ink">No connections yet</h2>
          <p className="mt-2 text-muted">
            Enrich your items to discover connections through shared entities and topics.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl border border-line bg-panel">
              <canvas
                ref={canvasRef}
                width={900}
                height={600}
                onClick={handleCanvasClick}
                className="cursor-pointer"
              />
            </div>
          </div>
          <div className="space-y-4">
            {selectedNode ? (
              <div className="rounded-xl border border-line bg-panel p-4">
                <h3 className="font-bold text-ink">{selectedNode.label}</h3>
                <p className="mt-1 text-xs text-muted capitalize">{selectedNode.type}</p>
                <p className="mt-2 text-sm text-muted">
                  {selectedNode.connections} connection{selectedNode.connections !== 1 ? 's' : ''}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-line bg-panel p-4 text-center text-sm text-muted">
                Click a node to see details
              </div>
            )}
            <div className="rounded-xl border border-line bg-panel p-4">
              <h3 className="mb-2 text-sm font-bold text-ink">Legend</h3>
              <div className="space-y-2 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange" />
                  <span>Content item</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-3 bg-line" />
                  <span>Connection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
