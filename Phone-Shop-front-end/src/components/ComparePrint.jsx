 import { useState, useEffect, useMemo } from "react";

const  ComparePrint = ({ products, showRemove }) => {
   
  const displayProducts = useMemo(() => {
  const slots = [...products];

  while (slots.length < 4) {
    slots.push(null);
  }

  return slots;
}, [products]);

  //const dispatch = useDispatch();
  
   
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const obj = {};

    displayProducts.filter(Boolean).forEach((product) => {
      obj[product._id] = {
        storage: product.defaultStorage,
        color: product.defaultColor,
      };
    });

    return obj;
  });

   
  
 useEffect(() => {
  setSelectedVariants((prev) => {
    let changed = false;
    const next = { ...prev };

    displayProducts.filter(Boolean).forEach((product) => {
      const current = next[product._id];

      if (
        !current ||
        current.storage !== product.defaultStorage ||
        current.color !== product.defaultColor
      ) {
        next[product._id] = {
          storage: product.defaultStorage,
          color: product.defaultColor,
        };
        changed = true;
      }
    });

    return changed ? next : prev;
  });
}, [products]);

  const getSelectedVariant = (product) => {
    if (!product) return null;

    const selected = selectedVariants[product._id];

    return (
      product.variants.find(
        (v) => v.storage === selected?.storage
      ) || product.variants[0]
    );
  };

  

  const getSelectedColor = (product) => {
    if (!product) return null
    const variant = getSelectedVariant(product);

    return (
      variant.colors.find(
        (color) => color.name === selectedVariants[product._id]?.color
      ) || variant.colors[0]
    );
  };
 
 

   
  const TableRow = ({ title, renderValue }) => (
    <tr className="border-b last:border-b-0">
      <td className="bg-gray-50 font-semibold text-gray-800 px-5 py-4 min-w-[260px] text-center">
        {title}
      </td>

      {displayProducts.map((product, index) => (
        <td
          key={product ? `${product._id}-${index}` : `empty-${index}`}
          className="w-70 min-w-[180px] max-w-[320px] px-5 py-4 text-center align-top"
        >
          {renderValue(product, index)}
        </td>
      ))}
    </tr>
  );

   
   

  return (
    <>

      {/* Desktop */}
      <div className="overflow-visible bg-white">
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead className='w-56'>

           
            <TableRow
              title="image"
              renderValue={(product, index) => {
                
                
                if (!product) {
                  if(!showRemove) return null
                  return (
                    
                    <div className="flex flex-col items-center py-4 px-10">
                      <span className="text-gray-400 italic">
                        No phone selected.
                        Search and add a phone to compare.
                      </span>
                    </div>
                  );
                }
                
                const variant = getSelectedVariant(product);
                const color = getSelectedColor(product, variant);

                return (
                  <div
                        style={{
                            width: "100px",
                            height: "100px",
                            margin: "0 auto",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                        >
                        <img
                            src={color?.images?.[0]?.url || product.defaultImage}
                            alt={product.name}
                            style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            }}
                        />
                </div>
                );
              }}
            />
            <TableRow
              title="Name"
              renderValue={(product) =>
                product ? (
                  <span className="font-medium">
                    {product.name}
                  </span>
                  
                ) : (
                showRemove && (
                  <span className="text-gray-400 italic">
                    No phone selected
                  </span>
                )
                )
              }
            />

            <TableRow
              title="Brand"
              renderValue={(product) =>
                  
                product ? product.brand || "-" : 
                showRemove && (
                "-"
                )
                 
              }
            />

            <TableRow
              title="Starting Price"
              renderValue={(product) => {
                  
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }

                const color = getSelectedColor(product);
                return `$${color?.price || 0}`;
              }}
            />

            <TableRow
              title="Rating"
              renderValue={(product) =>
                product ? (
                  <>⭐ {product.rating?.toFixed(1) || "0.0"}</>
                ) : (
                  showRemove && (
                  "-"
                  )
                )
              }
            />

            <TableRow
              title="Reviews"
              renderValue={(product) =>

                product ? product.numReviews : 
                 showRemove && (
                "-"
                 )
              }
            />
            
            
            <TableRow
              title="Display"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }

                const variant = getSelectedVariant(product);
                return variant?.specs?.Display || "-";
              }}
            />

            <TableRow
              title="RAM"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }

                const variant = getSelectedVariant(product);
                return variant?.specs?.RAM || "-";
              }}
            />

            <TableRow
              title="Rear Camera"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }

                const variant = getSelectedVariant(product);
                return variant?.specs?.["Rear Camera"] || "-";
              }}
            />

            <TableRow
              title="Front Camera"

              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                const variant = getSelectedVariant(product);
                return variant?.specs?.["Front Camera"] || "-";
              }}


            />

            <TableRow
              title="Battery"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                const variant = getSelectedVariant(product);
                return variant?.specs?.Battery || "-";
              }}

            />

            <TableRow
              title="Chipset"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                const variant = getSelectedVariant(product);
                return variant?.specs?.Chipset || "-";
              }}
            />

            <TableRow
              title="Operating System"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                const variant = getSelectedVariant(product);
                return variant?.specs?.OS || "-";
              }}
            />

            <TableRow
              title="Build"

              renderValue={(product) => {
                if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                const variant = getSelectedVariant(product);
                return variant?.specs?.Build || "-";
              }}
            />


          </thead>

        </table>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Performance</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Chipset"

                renderValue={(product) => {
                  if (!product) {
                      if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected.
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.Chipset || "Search and add a phone to compare.";
                }}

              />

              <TableRow
                title="RAM"

                renderValue={(product) => {
                  if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.RAM || "-";
                }}
              />

              <TableRow
                title="Storage"

                renderValue={(product) => {
                   if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.Storage || "-";
                }}
              />

              <TableRow
                title="Operating System"

                renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.OS || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Display</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Display"
                renderValue={(product) => {
                  if (!product) {
                      if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected.
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.Display || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Camera</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Rear Camera"

                renderValue={(product) => {
                  if (!product) {
                      if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected.
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.["Rear Camera"] || "-";
                }}
              />

              <TableRow
                title="Front Camera"

                renderValue={(product) => {
                  if (!product){
                     if(!showRemove) return null
                       return(
                        <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          
                          Search and add a phone to compare.
                        </span>
                      </div>
                      ) 
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.["Front Camera"] || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Battery</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Battery"
                renderValue={(product) => {
                  if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected.
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Battery || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Design</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Build"
                renderValue={(product) => {
                  if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected.
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Build || "-";
                }}
              />

              <TableRow
                title="Other"

                renderValue={(product) => {
                   if (!product){
                     if(!showRemove) return null
                       return(
                        <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          
                          Search and add a phone to compare.
                        </span>
                      </div>
                      ) 
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Other || "-";
                }}
              />
 

            </tbody>
          </table>
        </div>
        <div className="mt-10 mb-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Connectivity</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Connectivity"

                renderValue={(product) => {
                  if (!product){
                     if(!showRemove) return null
                       return(
                        <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          
                          Search and add a phone to compare.
                        </span>
                      </div>
                      ) 
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Connectivity || "-";
                }}

              />

            </tbody>
          </table>
        </div>
      </div>

   

    </>
  );
};

export default  ComparePrint;