import { Popover, PopoverContent } from "@/components/ui/popover";

export function EditPopover({
  editOpen,
  setEditOpen,
  chosenLabel,
  setChosenLabel,
  chosenBody,
  setChosenBody,
} : {
  editOpen: boolean,
  setEditOpen: (open: boolean) => void,
  chosenLabel: string,
  setChosenLabel: (label: string) => void,
  chosenBody: string,
  setChosenBody: (body: string) => void,
}) {
  
  return (
    <div>
      <Popover open={editOpen}>
        <PopoverContent
          onInteractOutside={() => setEditOpen(false)}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div 
              style={{
                position: "absolute",
                right: "-200px",
                top: "200px",
                zIndex: 4, // ensure it is above the graph
                fontSize: "12px",
              }}
            >
              <label style={{display: "block"}}>label:</label>
              <input
                value={chosenLabel}
                onChange={(event) => setChosenLabel(event.target.value)}
              />
              <label style={{display: "block"}}>body:</label>
              <input 
                value={chosenBody} 
                onChange={(event) => setChosenBody(event.target.value)} 
              /> 
            </div>
        </PopoverContent>
      </Popover>

      {/* Ticketing System */}
      {/* <BugReport/> */}
    </div>
  );
}
