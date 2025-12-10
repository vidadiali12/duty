import React, { useEffect, useState } from 'react'
import './Pagination.css'

const Pagination = ({ page, setPage, pageSize, totalItem }) => {

    const [pageArr, setPageArr] = useState([])
    const [mainPage, setMainPage] = useState(null)

    const createPag = () => {
        console.log(totalItem, page)
        if (!totalItem) return;
        const countOfPage = Math.ceil(totalItem / pageSize)
        let pa = [];
        for (let i = 1; i <= countOfPage; i++) {
            pa.push(i)
        }
        setPageArr(pa);
        console.log(pa)
    }

    const changePage = (pageNumber) => {
        setPage(pageNumber)
        setMainPage(pageNumber)
    }

    const changePageBefore = (pageNumber) => {
        if (pageNumber > 1) {
            setPage(pageNumber - 1)
            setMainPage(pageNumber - 1)
        }
        else {

        }
    }

    const changePageAfter = (pageNumber) => {
        if (pageNumber < pageArr.length) {
            setPage(pageNumber + 1)
            setMainPage(pageNumber + 1)
        }
    }


    useEffect(() => {
        createPag();
    }, [])
    return (
        <div className='pag-box'>

            <button
                className={`pag-btn ${mainPage > 1 ? 'active' : ''}`}
                onClick={() => changePageBefore(page)}
            >
                Əvvəl
            </button>

            {
                (pageArr.length <= 4) && (
                    <>
                        {pageArr.slice(0, 4).map((p, i) => (
                            <button
                                key={i}
                                className={`pag-btn ${page === p ? 'active' : ''}`}
                                onClick={() => changePage(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </>
                )
            }


            {
                (pageArr.length > 4) && (
                    <>
                        {pageArr.slice(0, 2).map((p, i) => (
                            <button
                                key={i}
                                className={`pag-btn ${page === p ? 'active' : ''}`}
                                onClick={() => changePage(p)}
                            >
                                {p}
                            </button>
                        ))}

                        ...

                        {pageArr
                            .filter(p => p > 2 && p < pageArr.length - 1)
                            .map((p, i) => {
                                if (Math.abs(page - p) <= 1) {
                                    return (
                                        <button
                                            key={i}
                                            className={`pag-btn ${page === p ? 'active' : ''}`}
                                            onClick={() => changePage(p)}
                                        >
                                            {p}
                                        </button>
                                    )
                                }
                            })}


                        ...


                        {pageArr.slice(-2).map((p, i) => (
                            <button
                                key={i}
                                className={`pag-btn ${page === p ? 'active' : ''}`}
                                onClick={() => changePage(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </>
                )
            }



            <button
                className={`pag-btn ${mainPage < pageArr.length ? 'active' : ''}`}
                onClick={() => changePageAfter(page)}
            >
                Sonra
            </button>

        </div>
    );
}

export default Pagination