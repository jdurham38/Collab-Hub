import 'react-mentions';

declare module 'react-mentions' {
  interface MentionProps {
    onSearchChange?: (
      event: React.ChangeEvent<HTMLInputElement>,
      data: { query: string },
    ) => void;
  }
}
