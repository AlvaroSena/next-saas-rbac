import { api } from "./api-client";

interface GetProjectsResponse {
  projects: {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string | null;
    description: string;
    organizationId: string;
    ownerId: string;
    createdAt: string;
    owner: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  }[];
}

export async function getProjects(org: string) {
  const result = await api
    .get(`organizations/${org}/projects`)
    .json<GetProjectsResponse>();

  return result;
}
