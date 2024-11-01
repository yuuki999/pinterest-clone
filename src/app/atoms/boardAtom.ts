import { atom, useAtom } from 'jotai';

interface Board {
  id: string;
  title: string;
  description?: string;
}

// ボードのデータを保持するatom
export const boardsAtom = atom<Board[]>([]);
// ローディング状態を管理するatom
export const boardsLoadingAtom = atom<boolean>(false);
// ボードの取得状態を管理するatom
export const boardsFetchedAtom = atom<boolean>(false);

/// ボードを取得する関数を持つatom
export const fetchBoardsAtom = atom(
  null,
  async (get, set) => {
    // すでに取得済みの場合は何もしない
    if (get(boardsFetchedAtom)) return;

    try {
      set(boardsLoadingAtom, true);
      const response = await fetch('/api/boards');
      const data = await response.json();
      set(boardsAtom, data);
      set(boardsFetchedAtom, true);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      set(boardsLoadingAtom, false);
    }
  }
);

// 新規ボード作成用のatom
export const createBoardAtom = atom(
  null,
  async (get, set, newBoard: { title: string; description?: string }) => {
    try {
      set(boardsLoadingAtom, true);
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoard),
      });
      
      if (response.ok) {
        const createdBoard = await response.json();
        const currentBoards = get(boardsAtom);
        set(boardsAtom, [...currentBoards, createdBoard]);
        return createdBoard;
      }
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    } finally {
      set(boardsLoadingAtom, false);
    }
  }
);


interface SavePinToBoardParams {
  pinId: string;
  boardId: string;
}

// ボードに対する、ピンの保存状態を管理するatom
export const pinSavingAtom = atom<{ [key: string]: boolean }>({});

// ピンをボードに保存する処理を行うatom
export const savePinToBoardAtom = atom(
  null,
  async (get, set, { pinId, boardId }: SavePinToBoardParams) => {
    try {
      set(pinSavingAtom, prev => ({
        ...prev,
        [pinId]: true
      }));

      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinId }),
      });

      if (!response.ok) {
        throw response.status;
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving pin to board:', error);
      if (typeof error === 'number') {
        throw error;
      }

      // その他のエラーは500として扱う
      throw 500;
    } finally {
      set(pinSavingAtom, prev => ({
        ...prev,
        [pinId]: false
      }));
    }
  }
);

// カスタムフック
export function usePinBoardOperations(pinId: string) {
  const [saving] = useAtom(pinSavingAtom);
  const [, savePinToBoard] = useAtom(savePinToBoardAtom);

  return {
    saving: saving[pinId] || false,
    savePinToBoard: async (boardId: string) => {
      return await savePinToBoard({ pinId, boardId });
    }
  };
}
