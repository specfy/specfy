import { nanoid } from '@specfy/core';
import { computeNewProjectPosition, getComponentSize } from './helpers.js';
import { createNodeFromProject, getEdgeMarkers } from './transform.js';
/**
 * Completely recompute the organization graph's edges.
 * Output an up to date map of all edges.
 */
export async function recomputeOrgGraph({ orgId, updates, tx, }) {
    const projects = await tx.projects.findMany({
        where: { orgId: orgId },
        select: { id: true, name: true },
    });
    // Compute relations project by project
    // Instead of selecting all components from the org because that could be huge (if this project work someday)
    const relations = {};
    for (const project of projects) {
        const components = await tx.components.findMany({
            where: { orgId, projectId: project.id },
            select: { id: true, edges: true, type: true, typeId: true },
        });
        const rels = computeRelationsToProjects({
            components,
        });
        for (const [projectId, rel] of Object.entries(rels)) {
            if (rel.from.read || rel.from.write) {
                if (!relations[projectId]) {
                    relations[projectId] = {};
                }
                relations[projectId][project.id] = rel.from;
            }
            if (rel.to.read || rel.to.write) {
                if (!relations[project.id]) {
                    relations[project.id] = {};
                }
                relations[project.id][projectId] = rel.to;
            }
        }
    }
    // Try to find the old snapshot to keep the position and display
    const snapshot = await tx.flows.findFirst({
        where: { orgId: orgId },
    });
    const newFlow = rebuildFlow({
        oldFlow: snapshot?.flow,
        projects,
        relations,
        updates,
    });
    if (snapshot) {
        return await tx.flows.update({
            where: { id: snapshot.id },
            data: { flow: newFlow },
        });
    }
    return await tx.flows.create({
        data: { id: nanoid(), orgId, flow: newFlow },
    });
}
/**
 * Compute one project relations to any projects inside the same project.
 */
export function computeRelationsToProjects({ components, }) {
    // First iteration to get list of IDs that are project component
    const projectCompIds = [];
    const projectIds = [];
    for (const component of components) {
        if (component.type !== 'project') {
            continue;
        }
        projectCompIds.push(component.id);
        projectIds.push(component.typeId);
    }
    // Second iteration to get list of edges pointing from or to the list of IDs
    const edges = [];
    for (const component of components) {
        if (component.type !== 'project') {
            // Find link to project
            const has = component.edges.find((edge) => projectCompIds.includes(edge.target));
            if (has) {
                edges.push(has);
            }
            continue;
        }
        // Find from project
        edges.push(...component.edges);
    }
    // Compute the end results for each project
    // This will tell us if we read or write, and merge if there are multiple instance of the same project component
    const relations = {};
    for (const component of components) {
        if (component.type !== 'project') {
            continue;
        }
        // Compute edge from the outside project to the current
        const from = { read: false, write: false };
        for (const edge of component.edges) {
            if (edge.read)
                from.read = true;
            if (edge.write)
                from.write = true;
        }
        // Compute from current project to outside project
        const to = { read: false, write: false };
        for (const other of components) {
            if (other.type === 'project') {
                continue;
            }
            // Find link to project
            const has = other.edges.find((edge) => edge.target === component.id);
            if (!has) {
                continue;
            }
            if (has.read)
                to.read = true;
            if (has.write)
                to.write = true;
        }
        if (!relations[component.typeId]) {
            relations[component.typeId] = { from, to };
        }
        else {
            const update = relations[component.typeId];
            // We can have the same project linked multiple times so we need to merge
            relations[component.typeId] = {
                from: {
                    read: update.from.read || from.read,
                    write: update.from.write || from.write,
                },
                to: {
                    read: update.to.read || to.read,
                    write: update.to.write || to.write,
                },
            };
        }
    }
    return relations;
}
export function rebuildFlow({ projects, relations, oldFlow, updates, }) {
    const newFlow = {
        edges: [],
        nodes: [],
    };
    // Rebuild the whole snapshot
    for (const project of projects) {
        const prevNode = oldFlow?.nodes.find((nd) => nd.id === project.id);
        const update = updates?.nodes[project.id];
        let node;
        if (prevNode) {
            node = createNodeFromProject(project, update?.display || {
                pos: prevNode.position,
                size: prevNode.data.originalSize,
            });
        }
        else {
            node = createNodeFromProject(project, update?.display || {
                // TODO: place it better
                pos: computeNewProjectPosition(oldFlow || newFlow),
                size: getComponentSize('project', project.name),
            });
        }
        newFlow.nodes.push(node);
        if (!(project.id in relations)) {
            continue;
        }
        for (const [targetId, opts] of Object.entries(relations[project.id])) {
            const id = `${project.id}->${targetId}`;
            const prevEdge = oldFlow?.edges.find((ed) => ed.id === id);
            const updateEdge = updates?.edges[id];
            let edge;
            if (prevEdge) {
                edge = {
                    ...prevEdge,
                    sourceHandle: updateEdge?.sourceHandle || prevEdge.sourceHandle,
                    targetHandle: updateEdge?.targetHandle || prevEdge.targetHandle,
                    data: opts,
                };
            }
            else {
                edge = {
                    id,
                    source: project.id,
                    target: targetId,
                    sourceHandle: updateEdge?.sourceHandle || 'sr',
                    targetHandle: updateEdge?.targetHandle || 'tl',
                    data: opts,
                    ...getEdgeMarkers(opts),
                };
            }
            newFlow.edges.push(edge);
        }
    }
    return newFlow;
}
