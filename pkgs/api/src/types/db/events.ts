export interface DBEvent {
  id: string;
  orgId: string;
  projectId: string | null;
  event:
    | 'approved'
    | 'commented'
    | 'created'
    | 'deleted'
    | 'rejected'
    | 'updated';
  typeId: string;
  userId: string;
  publishedAt: string;
  payload: Record<string, any>;
}

// {
//   id: string;
//   type: 'rfc';
//   name: string;
//   slug: string;

//   project: {
//     id: string;
//     slug: string;
//   };
// }
