import { atom } from 'jotai';


//  TODO: 使っていない、ポップの管理を使用としたがよくわからなくなっているので頭が冴えている時に見直す
export interface UIState {
  isPopoverOpen: boolean;
  isNewBoardDialogOpen: boolean;
  isHovering: boolean;
}

// 基本アトム
export const uiStateAtom = atom<UIState>({
  isPopoverOpen: false,
  isNewBoardDialogOpen: false,
  isHovering: false,
});

// 派生アトム
export const shouldShowButtonsAtom = atom(
  (get) => {
    const uiState = get(uiStateAtom);
    return uiState.isPopoverOpen || uiState.isNewBoardDialogOpen || uiState.isHovering; // Pin状のUIが、いずれかtrueの場合にボタンを表示。
  }
);
