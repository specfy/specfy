import type { FlowEdge, ApiComponent, ApiProject } from '@specfy/models';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { useEdit } from '../../../hooks/useEdit';
import type { RouteComponent } from '../../../types/routes';
import {
  ComponentSelect,
  LanguageSelect,
  defaultFilterSelect,
} from '../../StackSearch';
import { ComponentLine, ComponentLineTech } from '../Line';

import cls from './index.module.scss';

import { getAllChilds, positionEdge } from '@/common/components';
import { useComponentsStore } from '@/common/store';

interface IsType {
  hosting: boolean;
  component: boolean;
  project: boolean;
}

export const ComponentDetails: React.FC<{
  proj: ApiProject;
  params: RouteComponent;
  component: ApiComponent;
}> = ({ params, component }) => {
  // TODO: Special case for project !
  // Components
  const [hosts, setHosts] = useState<ApiComponent[]>([]);
  const [contains, setContains] = useState<ApiComponent[]>([]);
  const [read, setRead] = useState<ApiComponent[]>([]);
  const [write, setWrite] = useState<ApiComponent[]>([]);
  const [readwrite, setReadWrite] = useState<ApiComponent[]>([]);
  const [receive, setReceive] = useState<ApiComponent[]>([]);
  const [answer, setAnswer] = useState<ApiComponent[]>([]);
  const [receiveAnswer, setReceiveAnswer] = useState<ApiComponent[]>([]);
  const is = useMemo<IsType>(() => {
    return {
      component: component.type !== 'hosting' && component.type !== 'project',
      hosting: component.type === 'hosting',
      project: component.type === 'project',
    };
  }, [component]);

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEditing;
  const storeComponents = useComponentsStore();

  useEffect(() => {
    const components = Object.values(storeComponents.components);
    const list = new Map<string, ApiComponent>();
    for (const c of components) {
      list.set(c.id, c);
    }

    const inVal = component.inComponent.id;
    const _in = inVal && list.get(inVal);

    const _hosts: ApiComponent[] = [];
    const _read = new Map<string, ApiComponent>();
    const _write = new Map<string, ApiComponent>();
    const _readwrite = new Map<string, ApiComponent>();
    const _receive = new Map<string, ApiComponent>();
    const _answer = new Map<string, ApiComponent>();
    const _receiveanswer = new Map<string, ApiComponent>();

    // Recursive find hosts
    if (_in) {
      let l = _in;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (l.type === 'hosting') {
          _hosts.push(l);
        }
        if (!l.inComponent.id) {
          break;
        }
        l = list.get(l.inComponent.id)!;
      }
    }

    // Find contains
    // First find direct ascendant then register all childs
    setContains(getAllChilds(components, component.id));

    for (const edge of component.edges) {
      if (edge.show === false) {
        continue;
      }

      if (edge.read && edge.write) {
        _readwrite.set(edge.target, list.get(edge.target)!);
      } else if (edge.write) {
        _write.set(edge.target, list.get(edge.target)!);
      } else {
        _read.set(edge.target, list.get(edge.target)!);
      }
    }

    for (const other of components) {
      if (other.id === component.id) {
        continue;
      }

      for (const edge of other.edges) {
        if (edge.target !== component.id) {
          continue;
        }

        if (edge.read && edge.write) {
          _receiveanswer.set(other.id, list.get(other.id)!);
        } else if (edge.write) {
          _receive.set(other.id, list.get(other.id)!);
        } else {
          _answer.set(other.id, list.get(other.id)!);
        }
      }
    }

    setHosts(_hosts);
    setRead(Array.from(_read.values()));
    setWrite(Array.from(_write.values()));
    setReadWrite(Array.from(_readwrite.values()));
    setReceive(Array.from(_receive.values()));
    setAnswer(Array.from(_answer.values()));
    setReceiveAnswer(Array.from(_receiveanswer.values()));
  }, [storeComponents, component]);

  const handleStackChange = (values: ApiComponent['techs']) => {
    storeComponents.updateField(component.id, 'techs', [...values]);
  };

  const handlePickData = (
    obj: string[] | string,
    category:
      | 'answer'
      | 'read'
      | 'readwrite'
      | 'receive'
      | 'receiveAnswer'
      | 'write',
    original: ApiComponent[]
  ) => {
    const values = obj as string[];
    const isRemove = original.length > values.length;
    const isFrom =
      category === 'readwrite' || category === 'read' || category === 'write';

    // ---- Remove edge
    if (isRemove) {
      const diff = original.filter((x) => !values.includes(x.id))[0];

      // Remove from this component to other
      if (isFrom) {
        const tmp: FlowEdge[] = [];
        for (const edge of component.edges) {
          if (edge.target === diff.id) {
            continue;
          }
          tmp.push(edge);
        }

        storeComponents.updateField(component.id, 'edges', tmp);
        return;
      }

      // Remove from this other to this component
      const tmp: FlowEdge[] = [];
      for (const edge of diff.edges) {
        if (component.id === edge.target) {
          continue;
        }
        tmp.push(edge);
      }
      storeComponents.updateField(diff.id, 'edges', tmp);
      return;
    }

    // ---- Add edges
    const diff = values.filter((x) => !original.find((o) => o.id === x))[0];
    const add = storeComponents.components[diff];

    if (!add) {
      throw new Error('Cant find component');
    }

    if (isFrom) {
      const tmp: FlowEdge[] = [];
      let exists: FlowEdge | false = false;
      for (const edge of component.edges) {
        if (edge.target === diff) {
          exists = JSON.parse(JSON.stringify(edge));
          continue;
        }

        tmp.push(edge);
      }

      const { source, target } = positionEdge(component, add);

      const edge: FlowEdge =
        exists !== false
          ? exists
          : {
              target: diff,
              portSource: 'sl',
              portTarget: 'tr',
              read: false,
              write: false,
              vertices: [],
            };
      edge.portSource = source;
      edge.portTarget = target;
      edge.read = category !== 'write';
      edge.write = category !== 'read';
      tmp.push(edge);

      storeComponents.updateField(component.id, 'edges', tmp);
      return;
    }

    const tmp: FlowEdge[] = [];
    let exists: FlowEdge | false = false;
    for (const edge of add.edges) {
      if (edge.target === component.id) {
        exists = JSON.parse(JSON.stringify(edge));
        continue;
      }

      tmp.push(edge);
    }

    const { source, target } = positionEdge(component, add);

    const edge: FlowEdge =
      exists !== false
        ? exists
        : {
            target: component.id,
            portSource: 'sl',
            portTarget: 'tr',
            read: false,
            write: false,
            vertices: [],
          };
    edge.portSource = source;
    edge.portTarget = target;
    edge.read = category !== 'receive';
    edge.write = category !== 'answer';
    tmp.push(edge);

    storeComponents.updateField(add.id, 'edges', tmp);
  };

  /**
   * Handle changing "Contains"
   */
  const handleContains = (values: string[]) => {
    const isRemove = contains.length > values.length;
    if (isRemove) {
      const diff = contains.filter((x) => !values.includes(x.id))[0];
      storeComponents.updateField(diff.id, 'inComponent', { id: null });
      // TODO: move outside HOST
      return;
    }

    // TODO: move inside HOST
    const diff = values.filter((x) => !contains.find((o) => o.id === x))[0];
    storeComponents.updateField(diff, 'inComponent', { id: component.id });
  };

  /**
   * Handle changing "Host"
   */
  const handleHost = (values: string[]) => {
    // TODO: move inside/outside HOST
    storeComponents.updateField(component.id, 'inComponent', {
      id: values.length > 0 ? values[0] : null,
    });
  };

  return (
    <div className={cls.details}>
      {(isEditing || component.techs.length > 0) &&
        is.component &&
        !component.techId && (
          <div>
            <div className={cls.blockTitle}>
              <h2>Stack</h2>
            </div>

            {(isEditing || component.techs.length > 0) && (
              <ComponentLineTech
                title="Build with"
                techs={component.techs}
                params={params}
                editing={isEditing}
              >
                <LanguageSelect
                  values={component.techs}
                  onChange={handleStackChange}
                />
              </ComponentLineTech>
            )}
          </div>
        )}

      {(isEditing || hosts.length > 0 || contains.length > 0) &&
        (is.component || is.hosting) && (
          <div>
            <div className={cls.blockTitle}>
              <h2>Hosting</h2>
            </div>

            {(isEditing || hosts.length > 0) && (
              <ComponentLine
                title="Hosted on"
                comps={hosts}
                params={params}
                editing={isEditing}
              >
                <ComponentSelect
                  current={component}
                  values={hosts.length > 0 ? [hosts[0]] : []}
                  filter={['hosting']}
                  createdAs="hosting"
                  multiple={false}
                  onChange={(res) => handleHost(res)}
                />
              </ComponentLine>
            )}

            {is.hosting && (isEditing || contains.length > 0) && (
              <ComponentLine
                title="Contains"
                comps={contains}
                params={params}
                editing={isEditing}
              >
                <ComponentSelect
                  current={component}
                  values={contains}
                  filter={
                    is.hosting
                      ? [...defaultFilterSelect, 'hosting']
                      : defaultFilterSelect
                  }
                  createdAs="service"
                  onChange={(res) => handleContains(res)}
                />
              </ComponentLine>
            )}
          </div>
        )}

      {(isEditing ||
        readwrite.length > 0 ||
        read.length > 0 ||
        write.length > 0 ||
        receive.length > 0 ||
        answer.length > 0 ||
        receiveAnswer.length > 0) &&
        !is.hosting && (
          <div>
            <div className={cls.blockTitle}>
              <h2>Data</h2>
            </div>

            {(isEditing || readwrite.length > 0) && (
              <ComponentLine
                title="Read and Write to"
                comps={readwrite}
                params={params}
                editing={isEditing}
              >
                <ComponentSelect
                  current={component}
                  values={readwrite}
                  createdAs="service"
                  onChange={(res) =>
                    handlePickData(res, 'readwrite', readwrite)
                  }
                />
              </ComponentLine>
            )}

            {(isEditing || read.length > 0) && (
              <ComponentLine
                title="Read from"
                comps={read}
                params={params}
                editing={isEditing}
              >
                <ComponentSelect
                  current={component}
                  values={read}
                  createdAs="service"
                  onChange={(res) => handlePickData(res, 'read', read)}
                />
              </ComponentLine>
            )}

            {(isEditing || write.length > 0) && (
              <ComponentLine
                title="Write to"
                comps={write}
                params={params}
                editing={isEditing}
              >
                <ComponentSelect
                  current={component}
                  values={write}
                  createdAs="service"
                  onChange={(res) => handlePickData(res, 'write', write)}
                />
              </ComponentLine>
            )}

            {(isEditing || receiveAnswer.length > 0) && (
              <ComponentLine
                title="Receive and Answer to"
                comps={receiveAnswer}
                params={params}
                editing={isEditing}
              >
                <ComponentSelect
                  current={component}
                  values={receiveAnswer}
                  createdAs="service"
                  onChange={(res) =>
                    handlePickData(res, 'receiveAnswer', receiveAnswer)
                  }
                />
              </ComponentLine>
            )}
            {(isEditing || receive.length > 0) && (
              <ComponentLine
                title="Receive from"
                comps={receive}
                params={params}
                editing={isEditing}
              >
                <ComponentSelect
                  current={component}
                  values={receive}
                  createdAs="service"
                  onChange={(res) => handlePickData(res, 'receive', receive)}
                />
              </ComponentLine>
            )}
            {(isEditing || answer.length > 0) && (
              <ComponentLine
                title="Answer to"
                comps={answer}
                params={params}
                editing={isEditing}
              >
                <ComponentSelect
                  current={component}
                  values={answer}
                  createdAs="service"
                  onChange={(res) => handlePickData(res, 'answer', answer)}
                />
              </ComponentLine>
            )}
          </div>
        )}
    </div>
  );
};
