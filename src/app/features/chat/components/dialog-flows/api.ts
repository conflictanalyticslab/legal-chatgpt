
const DBURL = "https://graph-module.openjustice.ai";

  const handleSave = () => {
    if (edges.length === 0 || nodes.length === 1) {
      console.log("No change");
      setSaving(false);
      return; // no changes have been made
    }

    // saves the graph to the database
    if (rfInstance) {
      if (!auth.currentUser) throw new Error("User is not authenticated");
      auth.currentUser.getIdToken().then((token) => {
        fetch(new URL("update", DBURL), {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: graphId, // if this is empty, it will create a new graph
            name: graphName,
            data: rfInstance.toObject(),
            public: usePublicDF,
          }), // create a json object of the graph
        })
          .then((response) => {
            if (!response.ok) throw new Error("Failed to save graph");
            else {
              setSaving(false);
              return response.json();
            }
          })
          .then((body) => {
            localStorage.setItem(lastGraphKey, JSON.stringify(body.id));
            setGraphId(body.id);
          }); // will waste an api call, but it's the simplest solution for now
      });
    }
  };

  const handleSubmit = () => {
    // only saves on submission for now
    handleSave();
    // make the query.
    let queryArray: [
      { data: string; type: string },
      { data: string; type: string },
      { data: string; type: string }
    ][] = [];
    edges.forEach((edge) => {
      let source: Node | undefined = nodes.find(
        (node) => node.id === edge.source
      );
      let target: Node | undefined = nodes.find(
        (node) => node.id === edge.target
      );

      if (source && target) {
        // should always pass
        queryArray.push([
          { data: source.data.body, type: source.type },
          { data: edge.data?.body, type: "edge" }, // in case we want to do edge types later
          { data: target.data.body, type: source.type },
        ] as [{ data: string; type: string }, { data: string; type: string }, { data: string; type: string }]);
      }
    });
    setDialogFlow(JSON.stringify(queryArray));
    setDialogFlowName(graphName);
    setOpen(false);
  };

  const handleNewGraph = () => {
    setGraphId(null);
    setGraphName("Default Name");
    setNodes(initialNodes);
    setEdges([]);
    setViewport({ zoom: 2, x: 500, y: 500 });
    setGraphLoading(false);
  };

  useEffect(() => {
    if (!auth.currentUser) throw new Error("User is not authenticated");
    auth.currentUser.getIdToken().then((token) => {
      // get user token for auth
      const latestGraphData = localStorage.getItem(lastGraphKey);

      // load the last used graph
      if (latestGraphData) {
        setGraphId(JSON.parse(latestGraphData));
        setGraphLoading(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!graphId) return;
    // retrieve the graph from the backend
    if (!auth.currentUser) throw new Error("User is not authenticated");
    auth.currentUser.getIdToken().then((token) => {
      setEditOpen(false); // close the edit dialog
      fetch(new URL(`retrieve/id/${graphId}`, DBURL), {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok)
            throw new Error("Failed to retrieve graph. Creating new graph.");
          return response.json();
        })
        .then(
          (body: { data: ReactFlowJsonObject; id: string; name: string }) => {
            setGraphName(body.name);
            setNodes(body.data.nodes);
            setEdges(body.data.edges);
            setViewport(body.data.viewport);
            setGraphLoading(false); // preferablly, this would use a proper trigger
          }
        )
        .catch((error) => {
          console.error(error);
          handleNewGraph();
        });
    });
  }, [graphId]);