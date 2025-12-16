import { Suspense } from "react";
import NewCasePageClient from "./NewCasePageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NewCasePageClient />
    </Suspense>
  );
}

