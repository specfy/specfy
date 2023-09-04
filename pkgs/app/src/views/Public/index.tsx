import type { ComputedFlow } from '@specfy/models';
import { Helmet } from 'react-helmet-async';

import { titleSuffix } from '@/common/string';
import { Flow, FlowWrapper } from '@/components/Flow';
import { Toolbar } from '@/components/Flow/Toolbar';

/**
 * This is a temporary page that preview the embedding of a Flow inside an iframe.
 * The Flow was dumped 2023-09-04
 */

const markerEnd = {
  type: 'arrowclosed' as any,
  width: 14,
  height: 14,
};
const metaEdge = {
  markerEnd,
  deletable: false,
  updatable: false,
};
const metaNode = {
  deletable: false,
  draggable: false,
  connectable: false,
  focusable: true,
  selectable: true,
};
const flow: ComputedFlow = {
  edges: [
    {
      id: 'jVECILL3wP64->0jgs1PGWe36g',
      source: 'jVECILL3wP64',
      target: '0jgs1PGWe36g',
      sourceHandle: 'sr',
      targetHandle: 'tl',
      data: { read: true, write: true },
      ...metaEdge,
    },
    {
      id: 'jVECILL3wP64->SXLFCrRPuivX',
      source: 'jVECILL3wP64',
      target: 'SXLFCrRPuivX',
      sourceHandle: 'st',
      targetHandle: 'tb',
      data: { read: true, write: true },
      ...metaEdge,
    },
    {
      id: 'jVECILL3wP64->PXBo4J8GjOW6',
      source: 'jVECILL3wP64',
      target: 'PXBo4J8GjOW6',
      sourceHandle: 'sb',
      targetHandle: 'tt',
      data: { read: true, write: true },
      ...metaEdge,
    },
    {
      id: 'jVECILL3wP64->4whPMUG6rgcX',
      source: 'jVECILL3wP64',
      target: '4whPMUG6rgcX',
      sourceHandle: 'sb',
      targetHandle: 'tt',
      data: { read: true, write: true },
      ...metaEdge,
    },
    {
      id: 'jVECILL3wP64->exVfSMUxXksc',
      source: 'jVECILL3wP64',
      target: 'exVfSMUxXksc',
      sourceHandle: 'st',
      targetHandle: 'tb',
      data: { read: true, write: true },
      ...metaEdge,
    },
    {
      id: 'jVECILL3wP64->onRm7AXWRm5x',
      source: 'jVECILL3wP64',
      target: 'onRm7AXWRm5x',
      sourceHandle: 'sr',
      targetHandle: 'tl',
      data: { read: false, write: true },
      ...metaEdge,
    },
    {
      id: 'jVECILL3wP64->fokqTPPqJS0R',
      source: 'jVECILL3wP64',
      target: 'fokqTPPqJS0R',
      sourceHandle: 'sl',
      targetHandle: 'tr',
      data: { read: true, write: true },
      ...metaEdge,
    },
    {
      id: '1ZlgfGsULlrH->DZOnIZnoaBoz',
      source: '1ZlgfGsULlrH',
      target: 'DZOnIZnoaBoz',
      sourceHandle: 'sb',
      targetHandle: 'tt',
      data: { read: true, write: true },
      ...metaEdge,
    },
    {
      id: '1ZlgfGsULlrH->4whPMUG6rgcX',
      source: '1ZlgfGsULlrH',
      target: '4whPMUG6rgcX',
      sourceHandle: 'sl',
      targetHandle: 'tr',
      data: { read: true, write: true },
      ...metaEdge,
    },
    {
      id: '1ZlgfGsULlrH->jVECILL3wP64',
      source: '1ZlgfGsULlrH',
      target: 'jVECILL3wP64',
      sourceHandle: 'sl',
      targetHandle: 'tr',
      data: { read: true, write: true },
      ...metaEdge,
    },
    {
      id: 'dfVY1sMNPpxo->lDFYgwl8szpT',
      source: 'dfVY1sMNPpxo',
      target: 'lDFYgwl8szpT',
      sourceHandle: 'sr',
      targetHandle: 'tl',
      data: { read: true, write: true },
      ...metaEdge,
    },
    {
      id: 'dfVY1sMNPpxo->AWZLwLhP0QMH',
      source: 'dfVY1sMNPpxo',
      target: 'AWZLwLhP0QMH',
      sourceHandle: 'sb',
      targetHandle: 'tt',
      data: { read: true, write: true },
      ...metaEdge,
    },
    {
      id: 'PXBo4J8GjOW6->f9gyZLckxliy',
      source: 'PXBo4J8GjOW6',
      target: 'f9gyZLckxliy',
      sourceHandle: 'sb',
      targetHandle: 'tt',
      data: { read: false, write: true },
      ...metaEdge,
    },
  ],
  nodes: [
    {
      id: 'qwmdjFTnWzOT',
      type: 'custom',
      data: {
        name: 'Google Cloud Platform',
        type: 'hosting',
        techId: 'gcp',
        typeId: null,
        originalSize: { width: 652, height: 313 },
        source: 'github',
      },
      position: { x: -50.04072900158479, y: 20 },
      style: { width: '652px', height: '313px' },
      ...metaNode,
    },
    {
      id: 'lDFYgwl8szpT',
      type: 'custom',
      data: {
        name: 'Google Cloud Run',
        type: 'hosting',
        techId: 'gcp.cloudrun',
        typeId: null,
        originalSize: { width: 375, height: 254 },
        source: 'github',
      },
      position: { x: 258.26753768762046, y: 31.240492573762992 },
      style: { width: '375px', height: '254px' },
      extent: 'parent',
      parentNode: 'qwmdjFTnWzOT',
      ...metaNode,
    },
    {
      id: 'mgUaGlWJqKmb',
      type: 'custom',
      data: {
        name: 'Vercel',
        type: 'hosting',
        techId: 'vercel',
        typeId: null,
        originalSize: { width: 271, height: 198 },
        source: 'github',
      },
      position: { x: 632.1633573349216, y: 136.69046283574573 },
      style: { width: '271px', height: '198px' },
      ...metaNode,
    },
    {
      id: 'jVECILL3wP64',
      type: 'custom',
      data: {
        name: 'Api',
        type: 'service',
        techId: null,
        typeId: null,
        originalSize: { width: 148, height: 40 },
        source: 'github',
      },
      position: { x: 182.82536048752155, y: 22.787085283747047 },
      style: { width: '148px', height: '40px' },
      extent: 'parent',
      parentNode: 'lDFYgwl8szpT',
      ...metaNode,
    },
    {
      id: '1ZlgfGsULlrH',
      type: 'custom',
      data: {
        name: 'App',
        type: 'service',
        techId: null,
        typeId: null,
        originalSize: { width: 148, height: 40 },
        source: 'github',
      },
      position: { x: 30, y: 20 },
      style: { width: '148px', height: '40px' },
      extent: 'parent',
      parentNode: 'mgUaGlWJqKmb',
      ...metaNode,
    },
    {
      id: 'dfVY1sMNPpxo',
      type: 'custom',
      data: {
        name: 'Cloud Build',
        type: 'tool',
        techId: 'gcp.cloudbuild',
        typeId: null,
        originalSize: { width: 148, height: 40 },
        source: 'github',
      },
      position: { x: 42.37088567406937, y: 126.64279212283165 },
      style: { width: '148px', height: '40px' },
      extent: 'parent',
      parentNode: 'qwmdjFTnWzOT',
      ...metaNode,
    },
    {
      id: 'PXBo4J8GjOW6',
      type: 'custom',
      data: {
        name: 'Emails',
        type: 'service',
        techId: null,
        typeId: null,
        originalSize: { width: 172, height: 40 },
        source: 'github',
      },
      position: { x: 22.167619466694987, y: 103.6540302589046 },
      style: { width: '172px', height: '40px' },
      extent: 'parent',
      parentNode: 'lDFYgwl8szpT',
      ...metaNode,
    },
    {
      id: '0jgs1PGWe36g',
      type: 'custom',
      data: {
        name: 'Github',
        type: 'saas',
        techId: 'github',
        typeId: null,
        originalSize: { width: 130, height: 40 },
        source: 'github',
      },
      position: { x: 707.8235650119207, y: 47.83460690748211 },
      style: { width: '130px', height: '40px' },
      ...metaNode,
    },
    {
      id: 'AWZLwLhP0QMH',
      type: 'custom',
      data: {
        name: 'Google Secret Manager',
        type: 'db',
        techId: 'gcp.secretmanager',
        typeId: null,
        originalSize: { width: 206, height: 40 },
        source: 'github',
      },
      position: { x: 19.50120011951509, y: 239.24515029665787 },
      style: { width: '206px', height: '40px' },
      extent: 'parent',
      parentNode: 'qwmdjFTnWzOT',
      ...metaNode,
    },
    {
      id: 'fokqTPPqJS0R',
      type: 'custom',
      data: {
        name: 'Google SQL',
        type: 'db',
        techId: 'gcp.sql',
        typeId: null,
        originalSize: { width: 140, height: 40 },
        source: 'github',
      },
      position: { x: 44.88846401631173, y: 39.37876239494487 },
      style: { width: '140px', height: '40px' },
      extent: 'parent',
      parentNode: 'qwmdjFTnWzOT',
      ...metaNode,
    },
    {
      id: 'onRm7AXWRm5x',
      type: 'custom',
      data: {
        name: 'LogSnag',
        type: 'analytics',
        techId: 'logsnag',
        typeId: null,
        originalSize: { width: 130, height: 40 },
        source: 'github',
      },
      position: { x: 682.1292106007234, y: -48.69460685376636 },
      style: { width: '130px', height: '40px' },
      ...metaNode,
    },
    {
      id: 'exVfSMUxXksc',
      type: 'custom',
      data: {
        name: 'Openai',
        type: 'saas',
        techId: 'openai',
        typeId: null,
        originalSize: { width: 130, height: 40 },
        source: 'github',
      },
      position: { x: 267.78737260937476, y: -72.31714532096493 },
      style: { width: '130px', height: '40px' },
      ...metaNode,
    },
    {
      id: 'f9gyZLckxliy',
      type: 'custom',
      data: {
        name: 'Resend',
        type: 'saas',
        techId: 'resend',
        typeId: null,
        originalSize: { width: 130, height: 40 },
        source: 'github',
      },
      position: { x: 206.33632175541823, y: 364.29166132925076 },
      style: { width: '130px', height: '40px' },
      ...metaNode,
    },
    {
      id: '4whPMUG6rgcX',
      type: 'custom',
      data: {
        name: 'Socket',
        type: 'service',
        techId: null,
        typeId: null,
        originalSize: { width: 172, height: 40 },
        source: 'github',
      },
      position: { x: 165.4580959749809, y: 176.46630011520315 },
      style: { width: '172px', height: '40px' },
      extent: 'parent',
      parentNode: 'lDFYgwl8szpT',
      ...metaNode,
    },
    {
      id: 'SXLFCrRPuivX',
      type: 'custom',
      data: {
        name: 'Stripe',
        type: 'saas',
        techId: 'stripe',
        typeId: null,
        originalSize: { width: 130, height: 40 },
        source: 'github',
      },
      position: { x: 479.5949286846276, y: -77.95832012678292 },
      style: { width: '130px', height: '40px' },
      ...metaNode,
    },
    {
      id: 'DZOnIZnoaBoz',
      type: 'custom',
      data: {
        name: 'Vercel Analytics',
        type: 'analytics',
        techId: 'vercel.analytics',
        typeId: null,
        originalSize: { width: 188, height: 40 },
        source: 'github',
      },
      position: { x: 34.120516090571755, y: 121.60341127452222 },
      style: { width: '188px', height: '40px' },
      extent: 'parent',
      parentNode: 'mgUaGlWJqKmb',
      ...metaNode,
    },
  ],
};

export const Public: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Helmet title={`Flow - ${titleSuffix}`} />

      <FlowWrapper>
        <Flow
          readonly={true}
          flow={flow}
          downlightOther={false}
          keepHighlightOnSelect={true}
        />

        <Toolbar left top visible>
          <Toolbar.Help title="Curious about this?">
            <div>
              <p>
                This is Specfy&apos;s full infrastructure graph generated by
                Specfy. #dogfooding
              </p>
              <p>
                Want the same thing? Register to{' '}
                <strong>
                  <a href="https://app.specfy.io/">Specfy</a>
                </strong>{' '}
                and import your GitHub repository.
              </p>
            </div>
            <br />
          </Toolbar.Help>
        </Toolbar>
        <Toolbar bottom visible>
          <Toolbar.Zoom />
        </Toolbar>
      </FlowWrapper>
    </div>
  );
};
