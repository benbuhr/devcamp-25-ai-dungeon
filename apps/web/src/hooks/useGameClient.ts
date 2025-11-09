import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientState, GameState } from "@ashen/shared";
import {
  CommandRequestBody,
  CommandResponse,
  fetchState,
  sendCommand
} from "../lib/api";

const stateKey = (sessionId: string) => ["game-state", sessionId];

export const useGameClient = (sessionId: string | null) => {
  const queryClient = useQueryClient();

  const stateQuery = useQuery({
    queryKey: sessionId ? stateKey(sessionId) : [],
    queryFn: async () => {
      if (!sessionId) throw new Error("No session");
      return fetchState(sessionId);
    },
    enabled: Boolean(sessionId),
    staleTime: 5_000
  });

  const commandMutation = useMutation({
    mutationFn: async (input: CommandRequestBody) => {
      if (!sessionId) {
        throw new Error("Missing session id");
      }
      return sendCommand(sessionId, input);
    },
    onSuccess: (response: CommandResponse) => {
      if (!sessionId) return;
      if (response.state) {
        queryClient.setQueryData<{ state: GameState; client?: ClientState }>(
          stateKey(sessionId),
          (prev) => {
            return {
              state: response.state as GameState,
              client: response.client ?? (prev as any)?.client
            };
          }
        );
      }
    }
  });

  return {
    stateQuery,
    commandMutation
  };
};

