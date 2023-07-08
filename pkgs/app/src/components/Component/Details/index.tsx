import type { ApiComponent, ApiProject } from '@specfy/api/src/types/api';
import type { FlowEdge } from '@specfy/api/src/types/db';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { getAllChilds, positionEdge } from '../../../common/components';
import { useComponentsStore } from '../../../common/store';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteComponent } from '../../../types/routes';
import { ComponentSelect, LanguageSelect } from '../../StackSearch';
import { ComponentLine, ComponentLineTech } from '../Line';

import cls from './index.module.scss';

interface IsType {
  hosting: boolean;
  component: boolean;
  project: boolean;
}

export const ComponentDetails: React.FC<{
  proj: ApiProject;
  params: RouteComponent;
  component: ApiComponent;
  components: ApiComponent[];
}> = ({ params, component, components }) => {
  // TODO: Special case for project !
  // Components
  const [inComp, setInComp] = useState<ApiComponent>();
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
      component: component.type === 'service',
      hosting: component.type === 'hosting',
      project: component.type === 'project',
    };
  }, [component]);

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEditing;
  const storeComponents = useComponentsStore();

  useEffect(() => {
    const list = new Map<string, ApiComponent>();
    for (const c of components) {
      list.set(c.id, c);
    }

    const inVal = component.inComponent;
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
        if (!l.inComponent) {
          break;
        }
        l = list.get(l.inComponent)!;
      }
    }
    if (_in && _in.type !== 'hosting') {
      setInComp(_in);
    } else {
      setInComp(undefined);
    }

    // Find contains
    // First find direct ascendant then register all childs
    setContains(getAllChilds(components, component.id));

    for (const edge of component.edges) {
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
  }, [components]);

  const handleStackChange = (values: string[]) => {
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
    const add = components.find((c) => c.id === diff)!;

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

  const handleInComponent = (values: string[] | string) => {
    if (typeof values === 'string') {
      const childs = getAllChilds(components, component.id);
      for (const child of childs) {
        if (child.inComponent === component.id) {
          storeComponents.updateField(child.id, 'inComponent', null);
        }
      }
    }

    storeComponents.updateField(
      component.id,
      'inComponent',
      (values as string) || null
    );
  };

  const handleContains = (values: string[] | string) => {
    for (const value of values) {
      if (value === component.inComponent) {
        storeComponents.updateField(component.id, 'inComponent', null);
      }

      storeComponents.updateField(value, 'inComponent', component.id);
    }
  };

  const handleHost = (values: string[] | string) => {
    storeComponents.updateField(
      component.id,
      'inComponent',
      (values as string) || null
    );
  };

  return (
    <div className={cls.details}>
      {(isEditing || component.techs.length > 0) &&
        is.component &&
        !component.techId && (
          <div>
            <div className={cls.blockTitle}>
              <h4>Stack</h4>
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

      {(isEditing || hosts.length > 0 || inComp || contains.length > 0) &&
        (is.component || is.hosting) && (
          <div>
            <div className={cls.blockTitle}>
              <h4>Hosting</h4>
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

            {(isEditing || contains.length > 0) && (
              <ComponentLine
                title="Contains"
                comps={contains}
                params={params}
                editing={isEditing}
              >
                <ComponentSelect
                  current={component}
                  values={contains}
                  filter={is.hosting ? ['service', 'hosting'] : ['service']}
                  createdAs="service"
                  onChange={(res) => handleContains(res)}
                />
              </ComponentLine>
            )}

            {(isEditing || inComp) && (
              <ComponentLine
                title="Run inside"
                comps={inComp && [inComp]}
                params={params}
                editing={isEditing}
              >
                <ComponentSelect
                  current={component}
                  values={inComp ? [inComp] : []}
                  multiple={false}
                  filter={['service']}
                  createdAs="service"
                  onChange={(res) => handleInComponent(res)}
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
              <h4>Data</h4>
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
