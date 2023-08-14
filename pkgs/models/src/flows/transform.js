export function createNodeFromProject(project, display) {
    return createNode({
        id: project.id,
        name: project.name,
        type: 'project',
        display: display,
        inComponent: null,
        techId: null,
        typeId: null,
    });
}
export function createNode(component) {
    const node = {
        id: component.id,
        type: 'custom',
        data: {
            name: component.name,
            type: component.type,
            techId: component.techId,
            typeId: component.typeId,
            originalSize: component.display.size,
        },
        position: { ...component.display.pos },
        style: {
            width: `${component.display.size.width}px`,
            height: `${component.display.size.height}px`,
        },
    };
    if (component.inComponent) {
        node.extent = 'parent';
        node.parentNode = component.inComponent;
    }
    return node;
}
export function getEdgeMarkers(data) {
    const edge = {};
    // if (data.read) {
    //   edge.markerStart = {
    //     type: 'arrowclosed' as any,
    //     width: 10,
    //     height: 10,
    //   };
    // }
    if (data.write) {
        edge.markerEnd = {
            type: 'arrowclosed',
            width: 10,
            height: 10,
        };
    }
    return edge;
}
export function componentsToFlow(components) {
    const edges = [];
    const nodes = [];
    // Create all hosting nodes
    // We need to add them first because React Flow is not reordering
    const hosts = components.filter((comp) => comp.type === 'hosting');
    const done = [];
    let i = 0;
    while (i < 9999) {
        i += 1;
        if (hosts.length <= 0) {
            break;
        }
        const host = hosts.shift();
        if (host.inComponent && !done.includes(host.inComponent)) {
            hosts.push(host);
            continue;
        }
        nodes.push(createNode(host));
        done.push(host.id);
    }
    if (i >= 9999) {
        throw new Error("Can't compute host");
    }
    // Create all other nodes
    for (const comp of components) {
        if (comp.type === 'hosting') {
            continue;
        }
        nodes.push(createNode(comp));
    }
    for (const comp of components) {
        for (const edge of comp.edges) {
            const item = {
                id: `${comp.id}->${edge.target}`,
                source: comp.id,
                target: edge.target,
                sourceHandle: edge.portSource,
                targetHandle: edge.portTarget,
                data: { read: edge.read, write: edge.write },
                ...getEdgeMarkers(edge),
                // type: 'floating',
            };
            edges.push(item);
        }
    }
    return { edges, nodes };
}
